import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { ProtectedPage } from '../protected-page/protected-page';

import { Observable } from 'rxjs-compat';
import { HttpClient } from '@angular/common/http';
import 'rxjs/Rx';
import { AuthService } from '../../providers/auth-service/auth-service';

import { ToastService } from '../../providers/util/toast.service';
import { AlertService } from '../../providers/util/alert.service';

import { LoginPage } from '../../pages/login/login';

import { Storage } from '@ionic/storage';

import { Geolocation } from '@ionic-native/geolocation';

import { GeoFire } from 'geofire';

import { Firebase } from '@ionic-native/firebase';
import { AngularFireDatabaseModule, AngularFireDatabase } from 'angularfire2/database';

// Firebase Notifications
import { FcmProvider } from '../../providers/fcm/fcm';

import { ToastController } from 'ionic-angular';
import { Subject } from 'rxjs-compat/Subject';
import { tap } from 'rxjs-compat/operators/tap';

import { Platform } from 'ionic-angular';

import { GoogleMaps, GoogleMap, GoogleMapsEvent, Marker, GoogleMapsAnimation, MyLocation, Environment, GoogleMapOptions, BaseArrayClass, ILatLng } from '@ionic-native/google-maps';

/**
 * Generated class for the ProfilePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-profile',
  templateUrl: 'profile.html',
})
export class ProfilePage extends ProtectedPage {

  environment: Environment = null;

  profilePicture: string;
  profileRef: any;
  errorMessage: any;
  placeholderPicture = 'https://api.adorable.io/avatar/200/bob';

  enableNotifications = true;
  language: any;
  currency: any;
  paymentMethod: any;

  languages = ['English', 'Portuguese', 'French'];
  paymentMethods = ['Paypal', 'Credit Card'];
  currencies = ['USD', 'BRL', 'EUR'];

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

  driver: Observable<any>;

  LocateButtonText: string = "Ubicar";
  locating: boolean = false;
  movedCamera: boolean = false;

  latitude: any = "";
  longitude: any = "";
  fbLatitude: any = "";
  fbLongitude: any = "";

  watch: any;
  subscription: any;

  map: GoogleMap;
  myLocationMarker: Marker;

  constructor(
    public storage: Storage,
    public navCtrl: NavController,
    public navParams: NavParams,
    public alertService: AlertService,
    //public toastCtrl: ToastService,
    public authService: AuthService,
    private geolocation: Geolocation,
    public httpClient: HttpClient,
    public fcm: FcmProvider,
    public toastCtrl: ToastController,
    private myFirebase: Firebase,
    private af: AngularFireDatabase,
    private platform: Platform
  ) { super(navCtrl, storage); }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ProfilePage');
    //this.environment = new Environment();
    //this.environment.setBackgroundColor("#303030");
    this.getUserInfo();
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

  }

  loadMap() {
    // If you want to run your app
    // on browser, insert this line.

    Environment.setEnv({
      'API_KEY_FOR_BROWSER_RELEASE': 'AIzaSyCmz7oHEd5LqSGdal0vtfWUOkxn9GSUKt4',
      'API_KEY_FOR_BROWSER_DEBUG': 'AIzaSyCmz7oHEd5LqSGdal0vtfWUOkxn9GSUKt4'
    });

    // Create a map
    // after the view is ready
    // and the native platform is ready.
    let POINTS: BaseArrayClass<any> = new BaseArrayClass<any>([
      {
        position: { lat: 14.0746752, lng: -87.1923712 },
        icon: {
          url: "./assets/icon/person-icon.png",
          size: {
            width: 24,
            height: 24
          }
        }
      },
      {
        position: { lat: 14.09304594, lng: -87.22221311 },
        icon: {
          url: "./assets/icon/taxi-icon.png",
          size: {
            width: 24,
            height: 24
          }
        }
      }]);

    let bounds: ILatLng[] = POINTS.map((data: any, idx: number) => {
      console.log(data);
      return data.position;
    });

    let mapOptions: GoogleMapOptions = {
      controls: {
        zoom: false,
        myLocation: true,
        myLocationButton: true,
        indoorPicker: true,
        mapToolbar: true,
        compass: false
      },
      camera: {
        target: bounds,
        //zoom: 15,
        //tilt: 30
      }
    };

    this.map = GoogleMaps.create('map_canvas', mapOptions);

    POINTS.forEach((data: any) => {
      data.disableAutoPan = true;
      let marker: Marker = this.map.addMarkerSync(data);
      //marker.setIcon(data.iconData);
      //marker.on(GoogleMapsEvent.MARKER_CLICK).subscribe(this.onMarkerClick);
      //marker.on(GoogleMapsEvent.INFO_CLICK).subscribe(this.onMarkerClick);
    });
  }

  onMarkerClick(params: any) {
    let marker: Marker = <Marker>params[1];
    let iconData: any = marker.get('iconData');
    marker.setIcon(iconData);
  }

  getUserInfo() {
    console.log("Getting User Information");
    Promise.all([this.storage.get("user_id"), this.storage.get("firstName"), this.storage.get("lastName"), this.storage.get("email"), this.storage.get("id_token")]).then(values => {
      console.log("User ID", values[0]);
      console.log("First Name", values[1]);
      this.user.user_id = values[0];
      this.user.name = values[1] + ' ' + values[2];
      this.user.email = values[3];
      this.idToken = values[4];
      this.getDriverInfo();
    });
  }

  getDriverInfo() {
    console.log("Getting Driver Information");

    this.driver = this.httpClient.get("https://45.56.125.220/api/v1/drivers/" + this.user.user_id + '/', {
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + this.idToken }
    });
    this.driver
      .subscribe(data => {
        console.log('my data: ', data);
        this.user.imageUrl = "https://45.56.125.220/media/" + data.picture;
        this.vehicle.id = data.vehicle.id;
        this.vehicle.register = data.vehicle.register;
        this.vehicle.number = data.vehicle.number;
      })
  }

  handleError(error) {
    return Observable.throw(error.json().error || 'Server error');
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


  logOut() {

    this.alertService.presentAlertWithCallback('Cerrar Sesión',
      'Esta Seguro que desea cerrar su sesión?').then((yes) => {
        if (yes) {
          //this.toastCtrl.create('Logged out of the application');

          this.authService.logout();
          this.navCtrl.setRoot(LoginPage);
        }
      });
  }

  ionViewWillLeave() {
    if (this.subscription != null) {
      this.subscription.unsubscribe();
    }

  }

}
