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
export class ProfilePage extends ProtectedPage{
  
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

  LocateButtonText:string = "Ubicar";
  locating:boolean = false;

  latitude:any = "";
  longitude:any = ""; 
  fbLatitude:any = "";
  fbLongitude:any = ""; 

  watch:any;
  subscription: any;
  

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
    this.getUserInfo();
    this.watch = this.geolocation.watchPosition({enableHighAccuracy: true });  
    
  }

  

  updateImage(value) {
    this.profilePicture = 'data:image/jpeg;base64,' + value.val();
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

  getDriverInfo(){
    console.log("Getting Driver Information");

    this.driver = this.httpClient.get("https://45.56.125.220/api/v1/drivers/" + this.user.user_id + '/' , {
      headers: {'Content-Type':'application/json','Authorization':'Bearer '+ this.idToken}
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

  getCurrentFirebaseLocation(){
    console.log("getCurrentFirebaseLocation");

    // Get a reference to the database service
    var carLocationRef = this.af.database.ref('carsLocations/'+this.vehicle.id);
    carLocationRef.on('value', (snapshot) => {
      console.log(snapshot.val());
      if(snapshot.exists()){
        let l = snapshot.val().l;      
        this.fbLatitude = l[0];
        this.fbLongitude = l[1];
      }
    });
  }

  locate():void{
    this.getCurrentFirebaseLocation();

    if(this.locating == false){
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
      
      geoFire.set(this.vehicle.id.toString(), [ this.latitude , this.longitude]).then(function() {
            console.log("My location changed to " + [ data.coords.latitude , data.coords.longitude]);
        });    

      });
    }else{
      console.log("Stopped Locating");
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
  
  ionViewWillLeave(){
    if(this.subscription != null){
      this.subscription.unsubscribe();
    }
    
  }

}
