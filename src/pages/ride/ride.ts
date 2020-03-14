import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, App } from 'ionic-angular';

import { Storage } from '@ionic/storage';

import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from 'angularfire2/firestore';

import { Observable } from 'rxjs';

import { Ride } from '../../models/ride.model';

import { Device } from '../../models/device.model';

import { FirestoreProvider as RideServiceProvider } from '../../providers/firestore/firestore';

import { Geolocation } from '@ionic-native/geolocation';

import { GoogleMaps, GoogleMap, GoogleMapsEvent, Marker, GoogleMapsAnimation, MyLocation, Environment, GoogleMapOptions, BaseArrayClass, ILatLng } from '@ionic-native/google-maps';

import { GeoFire } from 'geofire';

import { Firebase } from '@ionic-native/firebase';
import { AngularFireDatabaseModule, AngularFireDatabase } from 'angularfire2/database';

import { RidesPage } from '../../pages/rides/rides';

import { Insomnia } from '@ionic-native/insomnia';

import { HttpClient, HttpHeaders } from '@angular/common/http';

import { CallNumber } from '@ionic-native/call-number';


/**
 * Generated class for the RidePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-ride',
  templateUrl: 'ride.html',
})
export class RidePage {

  //@ViewChild('map') mapElement: ElementRef;
  //map: any;
  showbutton = true;

  public ride: Observable<Ride>;

  public rideId;

  public status;
  public statusId; 
  public passengerId;

  watch: any;
  subscription: any;

  map: GoogleMap;
  myLocationMarker: Marker;

  LocateButtonText: string = "Ubicar";
  locating: boolean = false;
  movedCamera: boolean = false;

  latitude: any = "";
  longitude: any = "";
  fbLatitude: any = "";
  fbLongitude: any = "";

  idToken: string;
  user = {
    user_id: '',
    name: '',
    email: '',
    imageUrl: '../assets/img/avatar/user.png'
  };

  vehicle = {
    id: '',
    register: '',
    number: ''
  }

  markerAdded: boolean = false;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public storage: Storage,
    public firestore: AngularFirestore,
    public rideServiceProvider: RideServiceProvider,
    private geolocation: Geolocation,
    private af: AngularFireDatabase,
    public app: App,
    private insomnia: Insomnia,
    private http: HttpClient,
    private callNumber: CallNumber) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad RidePage');

    this.watch = this.geolocation.watchPosition({ enableHighAccuracy: true });
    let mapOptions: GoogleMapOptions = {
      controls: {
        zoom: false,
        //myLocation: true,
        //myLocationButton: true,
        indoorPicker: true,
        mapToolbar: true,
        compass: false
      },
      camera: {
        target: { lat: 14.087963, lng: -87.182993 },
        zoom: 15,
        //tilt: 30
      }
    };

    this.map = GoogleMaps.create('map_canvas', mapOptions);

    this.insomnia.keepAwake()
      .then(
        () => console.log('success'),
        () => console.log('error')
      );

  }

  ionViewWillLeave() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }

    this.insomnia.allowSleepAgain()
      .then(
        () => console.log('success'),
        () => console.log('error')
      );
  }

  ionViewWillEnter() {
    console.log('ionViewDidLoad PickUpArrivingPage');

    this.storage.get('vehicle_id').then((vehicle_id) => {
      this.vehicle.id = vehicle_id;
    });


    this.storage.get('user_id').then((user_id) => {
      console.log(user_id);
      const devicesRef = this.firestore.collection('rides', ref => ref.where('driverId', '==', user_id).where('status', '>', 1).where('status', '<', 5));
      console.log("Collection ref: " + devicesRef);
      var docId = devicesRef.snapshotChanges().map(changes => {
        return changes.map(a => {
          const data = a.payload.doc.data() as Ride;
          const id = a.payload.doc.id;
          console.log("Doc Id: " + id);
          console.log("Status: " + data.status);
          this.statusId = data.status;
          this.passengerId = data.passengerId;
          this.translateStatus(data.status);
          //this.loadMap(data.startLatitude, data.startLongitude, data.endLatitude, data.endLongitude);
          if (!this.markerAdded) {
            this.addMarker(data.startLatitude, data.startLongitude, true);
            this.addMarker(data.endLatitude, data.endLongitude, false);
            this.markerAdded = true;
          }


          var bounds = [
            { "lat": parseFloat(data.startLatitude), "lng": parseFloat(data.startLongitude) },
            { "lat": parseFloat(data.endLatitude), "lng": parseFloat(data.endLongitude) }
          ];


          this.map.moveCamera({
            target: bounds,
          });
          return { id };
        });
      });

      this.subscription = docId.subscribe(docs => {
        if (docs.length > 0) {
          docs.forEach(doc => {
            console.log(doc.id);
            this.ride = this.rideServiceProvider.getRide(doc.id).valueChanges();
            this.rideId = doc.id;
            //console.log(doc.status);           
          })
        } else {
          alert("Usted no tiene ninguna carrera confirmada");
          //this.appCtrl.getRootNav().push(CityCabPage);
          this.app.getActiveNav().setRoot(RidesPage);
        }
      });
    });
    //this.loadMap()
  }

  translateStatus(status) {
    if (status == 1) {
      this.status = "Localizando Conductor";
    } else if (status == 2) {
      this.status = "Conductor en Camino";
    } else if (status == 3) {
      this.status = "Unidad Afuera";
    } else if (status == 4) {
      this.status = "Carrera en Camino";
    } else if (status == 5) {
      this.status = "Carrera Finalizada";
    } else {
      this.status = "Pendiente";
    }
  }

  waitingPassenger(rideId) {
    if (rideId) {
      console.log("Ride to update: " + rideId);
      var ride = this.rideServiceProvider.getRide(rideId);
      ride.update({ status: 3 });
      this.sendNotificationToPassenger();
    } else {
      alert("No tiene ninguna solicitud para cancelar");
    }
  }

  sendNotificationToPassenger(){
    console.log(`PassengerId ${this.passengerId}`);
    const devicesRef = this.firestore.collection('devices', ref => ref.where('userId', '==', parseInt(this.passengerId)));
      console.log("Collection ref: " + devicesRef);
      var docId = devicesRef.snapshotChanges().map(changes => {
        return changes.map(a => {
          const data = a.payload.doc.data() as Device;
          const id = a.payload.doc.id;
          console.log("Doc Id of Devices: " + id);
          console.log("Passenger Token: " + data.token);
          
          const httpOptions = {
            headers: new HttpHeaders({
              'Content-Type':  'application/json',
              'Authorization': 'key=AAAAh-MeXCI:APA91bF5Sluxx0bywxpgthmjruvmoL_2DziPB9Xr3a9qmBXyO1i-LO0WWr78fgNPLDIx6DBdTk5vkkCZXfiri08vKL-1rRWFSHCANd3BSr03cFjfZ7iv08007xSfgzZtsfU1LvEf3su8'
            })
          };
      
          this.http.post('https://fcm.googleapis.com/fcm/send', {
            "notification":{
              "title":"Unidad Lista",
              "body":"Su unidad esta afuera.",
              "sound":"default",
              "click_action":"FCM_PLUGIN_ACTIVITY",
              "icon":"fcm_push_icon"
            },
            "data":{
              "param1":"value1",
              "param2":"value2"
            },
              "to":data.token,
              "priority":"high",
              "restricted_package_name":"com.seven.passengerapp",
          },httpOptions).subscribe((response) => {
            console.log(response);
          });


          return { data };
        });
      });

      const subscription = docId.subscribe(docs => {
        if (docs.length > 0) {
          docs.forEach(doc => {
            console.log(doc.data);
            console.log("Device data where passenger");
            //console.log(doc.status);           
          })
        } else {
          //alert("Usted no tiene ninguna carrera activa");
          //this.appCtrl.getRootNav().push(CityCabPage);
          //this.app.getActiveNav().setRoot(RidesPage);
        }
      });

      //subscription.unsubscribe();
  }

  startRide(rideId) {
    if (rideId) {
      console.log("Ride to update: " + rideId);
      var ride = this.rideServiceProvider.getRide(rideId);
      ride.update({ status: 4 });
    } else {
      alert("No tiene ninguna solicitud para iniciar carrera");
    }
  }

  endRide(rideId) {
    if (rideId) {
      console.log("Ride to update: " + rideId);
      var ride = this.rideServiceProvider.getRide(rideId);
      ride.update({ status: 5 });
    } else {
      alert("No tiene ninguna solicitud para finalizar Carrera");
    }
  }

  addMarker(lat, lng, origin) {

    let content;
    let url;
    if (origin) {
      content = "<h4>Origen</h4>";
      url = "assets/icon/red-dot.png";
    } else {
      content = "<h4>Destino</h4>";
      url = "assets/icon/green-dot.png";
    }

    this.map.addMarker({
      position: { lat: lat, lng: lng },
      icon: { url: url },
      animation: GoogleMapsAnimation.BOUNCE
    });

    //this.addInfoWindow(marker, content);

  }

  locate(): void {
    this.movedCamera = false;
    this.getCurrentFirebaseLocation();

    //this.loadMap();

    if (this.myLocationMarker != null) {
      this.myLocationMarker.remove();
      this.myLocationMarker = null;
    }



    if (this.locating == false) {
      console.log("Locating Vehicle with id: " + this.vehicle.id);
      this.LocateButtonText = "Parar";
      this.locating = true;
      // Create a new GeoFire instance at the random Firebase location
      var databaseLocationRef = this.af.database.ref('carsLocations');
      var geoFire = new GeoFire(databaseLocationRef);

      this.subscription = this.watch.subscribe((data) => {
        // data can be a set of coordinates, or an error (if an error occurred).
        // data.coords.latitude
        // data.coords.longitude
        console.log("Latitude: " + data.coords.latitude);
        console.log("Longitude: " + data.coords.longitude);

        this.latitude = data.coords.latitude;
        this.longitude = data.coords.longitude;

        geoFire.set(this.vehicle.id.toString(), [this.latitude, this.longitude]).then(function () {
          console.log("My location changed to " + [data.coords.latitude, data.coords.longitude]);
        });

        if (this.movedCamera == false) {
          this.myLocationMarker = this.map.addMarkerSync({
            position: { lat: this.latitude, lng: this.longitude },
            icon: {
              url: "./assets/icon/taxi-icon.png",
              size: {
                width: 24,
                height: 24
              }
            }
          });
          this.map.moveCamera({
            target: { lat: this.latitude, lng: this.longitude },
          });
          this.movedCamera = true;
        }

        this.myLocationMarker.setPosition({ lat: this.latitude, lng: this.longitude });
      });

      /*
      this.map.moveCamera({
        target: { lat: 14.087963, lng: -87.182993 },
        zoom: 15
      }).then(() => {
        //alert("Camera target has been changed");
      });
      */
    } else {
      console.log("Stopped Locating");
      if (this.myLocationMarker != null) {
        this.myLocationMarker.remove();
        this.myLocationMarker = null;
      }
      this.LocateButtonText = "Ubicar";
      this.locating = false;
      this.subscription.unsubscribe();
    }


  }

  getCurrentFirebaseLocation() {
    console.log("getCurrentFirebaseLocation");

    // Get a reference to the database service
    var carLocationRef = this.af.database.ref('carsLocations/' + this.vehicle.id);
    carLocationRef.on('value', (snapshot) => {
      console.log(snapshot.val());
      if (snapshot.exists()) {
        let l = snapshot.val().l;
        this.fbLatitude = l[0];
        this.fbLongitude = l[1];
      }
    });
  }

  call() {
    console.log('Calling');
    
    this.http.get('https://seven.hn/api/v1/passengers/' + this.passengerId)
        .subscribe(res => {
          //console.log(JSON.stringify(res));
          console.log(res['phone']);
          // If the API returned a successful response, mark the user as logged in
          // this need to be fixed on Laravel project to retun the New Token ;
          
          this.callNumber.callNumber(res['phone'], true)
            .then(res => console.log('Launched dialer!', res))
            .catch(err => console.log('Error launching dialer', err));
            
        }, err => {
          console.error('ERROR', err);
        });
        
  }

}
