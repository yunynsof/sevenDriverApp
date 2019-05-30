import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, App } from 'ionic-angular';

import { Observable } from 'rxjs';
import { Ride } from '../../models/ride.model';
import { FirestoreProvider } from '../../providers/firestore/firestore';

import { LoadingController } from 'ionic-angular';

import { Geolocation } from '@ionic-native/geolocation';

import {Storage} from '@ionic/storage';

import { RidePage } from '../../pages/ride/ride';

import { AlertService } from '../../providers/util/alert.service';


declare var google: any;

/**
 * Generated class for the RidesPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-rides',
  templateUrl: 'rides.html',
})
export class RidesPage {

  public rides = [];

  public title: any;

  public subscription: any;


  public service: any = new google.maps.DistanceMatrixService();

  public myLatitude: any;
  public myLongitude: any;

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams, 
    private firestoreProvider: FirestoreProvider, 
    public loadingCtrl: LoadingController, 
    private geolocation: Geolocation,
    private storage: Storage,
    public app: App,
    public alertService: AlertService) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad RidesPage');
    this.updateRides();
  }

  ionViewWillLeave(){
    this.subscription.unsubscribe();
  }

  updateRides(){
    let loader = this.loadingCtrl.create({
      content: "Por Favor Espere..."
    });
    loader.present();
    this.geolocation.getCurrentPosition({ maximumAge: 60000, timeout: 30000, enableHighAccuracy: true }).then((resp) => {
      loader.dismiss();

      this.myLatitude = resp.coords.latitude;
      this.myLongitude = resp.coords.longitude;

      /*
      this.rides = this.firestoreProvider.getRides().valueChanges();
      this.firestoreProvider.getRides().snapshotChanges()
        .subscribe(c => {
          this.title = "Carreras Disponibles (" + c.length + ")";
        });
        */

       let ridesDoc = this.firestoreProvider.getRides().snapshotChanges().map((actions: any) => {
        return actions.map(action => {
          this.rides = [];
          const data = action.payload.doc.data();
          const id = action.payload.doc.id;
          return {id, ...data};
        });
      });
      

      this.subscription = ridesDoc.subscribe(docs => {
        console.log("docs length: " + docs.length);
        this.title = "Carreras Disponibles (" + docs.length + ")";
        docs.forEach(doc => {
          console.log(doc.id);
          //this.ride = this.rideServiceProvider.getRide(doc.id).valueChanges();
          this.rides.push(doc);
          //console.log(doc.status);  
          return doc.id;         
        })
        /*
        if (docs.length > 0) {
          docs.forEach(doc => {
            console.log(doc.id);
            //this.ride = this.rideServiceProvider.getRide(doc.id).valueChanges();
            //this.rideId = doc.id;
            //console.log(doc.status);  
            return doc.id;         
          })
        } else {
          alert("Usted no tiene ninguna carrera activa");
          //this.appCtrl.getRootNav().push(CityCabPage);
        }*/
      });

      //console.log(rideId);

    }).catch((error) => {
      console.log('Error getting location', error);
      loader.dismiss();
      alert("No se ha podido obtener su ubicacion, por favor intente de nuevo.");
      this.app.getActiveNav().setRoot(RidePage); 
    });

    console.log(this.rides);
  }

  confirmRide(rideId, startLatitude, startLongitude) {  
    const loaderPassenger = this.loadingCtrl.create({
      content: "Esperando respuesta del cliente...",
      duration: 3000
    });

    var passenger = new google.maps.LatLng(startLatitude, startLongitude);
    var driver = new google.maps.LatLng(this.myLatitude, this.myLongitude); 
    
    var distance = google.maps.geometry.spherical.computeDistanceBetween(passenger, driver);       

    if((distance / 1000) > 5) {
      alert("No se puede seleccionar esta carrera, usted se encuentra a una distancia de " + Math.round(distance / 1000) + "Km del cliente." )
    }else{
      //loaderPassenger.present();
      //alert(rideId);
      this.alertService.presentAlertWithCallback('Aceptar Carrera',
      'Esta Seguro que desea aceptar esta carrera?').then((yes) => {
        if (yes) {
          if (rideId) {
            console.log("Ride to update Status: " + rideId);
    
            Promise.all([
              this.storage.get("user_id"), 
              this.storage.get("firstName"), 
              this.storage.get("lastName"), 
              this.storage.get("email"), 
              this.storage.get("id_token"),
              this.storage.get("vehicle_id"),
              this.storage.get("register"),
              this.storage.get("number")]
              ).then(values => {
              console.log("User ID", values[0]);
              console.log("First Name", values[1]);
              let user_id = values[0];
              let name = values[1] + ' ' + values[2];
              let email = values[3];
              let idToken = values[4];
              let vehicle_id = values[5];
              let register = values[6];
              let number = values[7];
              //this.getDriverInfo();
              var ride = this.firestoreProvider.getRide(rideId);
              ride.update({ status: 2, driverName: name, driverId: user_id, vehicleName: "Turismo", vehicleRegister: register});
              this.subscription.unsubscribe();
              this.updateRides();
            });
    
          } else {
            alert("Esta carrera ya no esta disponible.");
          }

          this.app.getActiveNav().setRoot(RidePage); 
        }
      });

      
    }
  }

}
