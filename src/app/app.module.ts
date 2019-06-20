// Global state (used for theming)
import { AppState } from './app.global';

import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';

import { Geolocation } from '@ionic-native/geolocation';
import { AuthService } from '../providers/auth-service/auth-service';

import { HttpClientModule } from '@angular/common/http'; 
import {HttpModule, Http} from '@angular/http';
import {AuthHttp, AuthConfig,JwtHelper} from 'angular2-jwt';

import {IonicStorageModule} from '@ionic/storage';
import {Storage} from '@ionic/storage';

import { MyApp } from './app.component';
import { LoginPage } from '../pages/login/login';
import { HomePage } from '../pages/home/home';
import { Firebase } from '@ionic-native/firebase';
import { RidesPage } from '../pages/rides/rides';
import { RidePage } from '../pages/ride/ride';



import { AngularFireModule } from 'angularfire2';
import { AngularFirestoreModule } from 'angularfire2/firestore';
import { AngularFireDatabaseModule, AngularFireDatabase } from 'angularfire2/database';
import { FcmProvider } from '../providers/fcm/fcm';

// Providers
import { ToastService } from '../providers/util/toast.service';
import { AlertService } from '../providers/util/alert.service';
import { FirestoreProvider } from '../providers/firestore/firestore';

import { GoogleMaps } from "@ionic-native/google-maps";

import { Device } from '@ionic-native/device';
import { RidesPageModule } from '../pages/rides/rides.module';
import { RidePageModule } from '../pages/ride/ride.module';

import { Insomnia } from '@ionic-native/insomnia';


let storage = new Storage({});

export function getAuthHttp(http) {
  return new AuthHttp(new AuthConfig({
    noJwtError: true,
    globalHeaders: [{'Accept': 'application/json'}],
    tokenGetter: (() => storage.get('id_token')),
  }), http);
}

const firebase = {
  apiKey: "AIzaSyAI755venVr58C5F1wExAlItIbyYFv98TQ",
  authDomain: "taxiexpress-ceb3f.firebaseapp.com",
  databaseURL: "https://taxiexpress-ceb3f.firebaseio.com",
  projectId: "taxiexpress-ceb3f",
  storageBucket: "taxiexpress-ceb3f.appspot.com",
  messagingSenderId: "583631002658"
}

@NgModule({
  declarations: [
    MyApp,
    LoginPage
  ],
  imports: [
    BrowserModule,
    AngularFireDatabaseModule,
    AngularFireModule.initializeApp(firebase), 
    AngularFirestoreModule,
    IonicModule.forRoot(MyApp),
    IonicStorageModule.forRoot(),
    HttpModule,
    HttpClientModule,
    RidesPageModule,
    RidePageModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    LoginPage,
    RidesPage,
    RidePage
  ],
  providers: [
    StatusBar,
    JwtHelper,
    AlertService,
    ToastService,    
    AppState,
    SplashScreen,
    GoogleMaps,
    {
      provide: AuthHttp,
      useFactory: getAuthHttp,
      deps: [Http]
    },
    Geolocation,
    Firebase,    
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    FcmProvider,
    AuthService,
    FirestoreProvider,
    Device,
    Insomnia
  ]
})
export class AppModule {}
