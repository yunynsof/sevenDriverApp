import { AppState } from './app.global';
import { Component, ViewChild } from '@angular/core';
import { Nav, Platform, MenuController, NavController } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { HomePage } from '../pages/home/home';

import {AuthService} from '../providers/auth-service/auth-service';

import { Firebase } from '@ionic-native/firebase';

import { FcmProvider } from '../providers/fcm/fcm';

import { App, ToastController } from 'ionic-angular';
import { AlertService } from '../providers/util/alert.service';
import { Subject } from 'rxjs/Subject';
import { tap } from 'rxjs/operators';

import { Storage } from '@ionic/storage';
import { Observable } from 'rxjs-compat';
import { HttpClient } from '@angular/common/http';
import 'rxjs/Rx';

import { Events } from 'ionic-angular';

import { LoginPage } from '../pages/login/login';
@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;

  rootPage: any;
  //rootPage:any = 'ProfilePage';
  activePage = new Subject();

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
    number: '',
    year: '',
    color: '',
    model: '',
    made: ''
  }

  driver: Observable<any>;


  pages: Array<{ title: string, component: any, active: boolean, icon: string }>;
  rightMenuItems: Array<{ icon: string, active: boolean }>;
  state: any;
  placeholder = 'assets/img/avatar/user.png';
  chosenPicture: any;

  constructor(
    platform: Platform, 
    statusBar: StatusBar,
    public app: App,
    splashScreen: SplashScreen, 
    firebase: Firebase, 
    fcm: FcmProvider, 
    toastCtrl: ToastController,
    public alertService: AlertService,
    public global: AppState,
    public menuCtrl: MenuController,
    public authService: AuthService,
    public storage: Storage,
    public httpClient: HttpClient,
    public events: Events) {
    
      platform.ready().then(() => {
        // Okay, so the platform is ready and our plugins are available.
        // Here you can do any higher level native things you might need.
        //this.global.set('theme', 'theme-dark');
        this.rootPage = 'ProfilePage';
        statusBar.styleDefault();
        splashScreen.hide();
        this.menuCtrl.enable(false, 'right');
        
        if(this.storage.get("user_id") != null )

        this.storage.get('user_id').then((user_id) => {
            if (user_id == null) {
              events.subscribe('user:created', () => {
                // user and time are the same arguments passed in `events.publish(user, time)`
                //console.log('Welcome', user, 'at', time);
                this.getUserInfo();
              });
          } else {
            this.getUserInfo();
          }
        });

        

        if(platform.is('cordova')) {
            // Listen to incoming messages
            fcm.listenToNotifications().pipe(
                tap(msg => {
                  // show a toast
                  const toast = toastCtrl.create({
                    message: msg["body"],
                    duration: 3000
                  });
                  toast.present();
                })
              )
              .subscribe();            
          }
      });
    

      this.rightMenuItems = [
        { icon: 'home', active: true },
        { icon: 'alarm', active: false },
        { icon: 'analytics', active: false },
        { icon: 'archive', active: false },
        { icon: 'basket', active: false },
        { icon: 'body', active: false },
        { icon: 'bookmarks', active: false },
        { icon: 'camera', active: false },
        { icon: 'beer', active: false },
        { icon: 'power', active: false },
      ];

      this.pages = [
        { title: 'Carrera Activa', component: 'RidePage', active: false, icon: 'car' },
        { title: 'Carreras Disponibles', component: 'RidesPage', active: false, icon: 'map' },
        { title: 'Perfil', component: 'ProfilePage', active: true, icon: 'contact' },
        { title: 'Historial', component: 'RidesPage', active: false, icon: 'list-box' },
        { title: 'Ayuda', component: 'RidesPage', active: false, icon: 'help' }
      ];

      this.activePage.subscribe((selectedPage: any) => {
        this.pages.map(page => {
          page.active = page.title === selectedPage.title;
        });
      });
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
      this.vehicle.year = data.vehicle.year;
      this.vehicle.color = data.vehicle.color;
      this.vehicle.model = data.vehicle.model;
      this.vehicle.made = data.vehicle.made;
      this.storage.set("vehicle_id", this.vehicle.id);
      this.storage.set("register", this.vehicle.register);
      this.storage.set("number", this.vehicle.number);
      this.storage.set("year", this.vehicle.year);
      this.storage.set("color", this.vehicle.color);
      this.storage.set("model", this.vehicle.model);
      this.storage.set("made", this.vehicle.made);
    })
  }

  openPage(page) {
    // Reset the content nav to have just this page
    // we wouldn't want the back button to show in this scenario
    this.nav.setRoot(page.component);
    this.activePage.next(page);
  }

  logOut() {

    this.alertService.presentAlertWithCallback('Cerrar Sesión',
      'Esta Seguro que desea cerrar su sesión?').then((yes) => {
        if (yes) {
          //this.toastCtrl.create('Logged out of the application');

          this.authService.logout();
          this.app.getActiveNav().setRoot(LoginPage); 
        }
      });
  }
}

