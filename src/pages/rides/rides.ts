import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

import { Observable } from 'rxjs';
import { Ride } from '../../models/ride.model';
import { FirestoreProvider } from '../../providers/firestore/firestore';

import { LoadingController } from 'ionic-angular';

import { Geolocation } from '@ionic-native/geolocation';

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

  public rides;

  public title: any;

  public loader = this.loadingCtrl.create({
    content: "Por Favor Espere..."
  });


  public service: any = new google.maps.DistanceMatrixService();

  public myLatitude: any;
  public myLongitude: any;

  constructor(public navCtrl: NavController, public navParams: NavParams, private firestoreProvider: FirestoreProvider, public loadingCtrl: LoadingController, private geolocation: Geolocation) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad RidesPage');

    this.loader.present();

    this.geolocation.getCurrentPosition().then((resp) => {
      this.loader.dismiss();

      this.myLatitude = resp.coords.latitude;
      this.myLongitude = resp.coords.longitude;

      this.rides = this.firestoreProvider.getRides().valueChanges();
      this.firestoreProvider.getRides().snapshotChanges()
        .subscribe(c => {
          this.title = "Carreras Disponibles (" + c.length + ")";
        });

    }).catch((error) => {
      console.log('Error getting location', error);
    });


  }

  confirmRide(startLatitude, startLongitude) {  
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
      loaderPassenger.present();
    }
  }

}
