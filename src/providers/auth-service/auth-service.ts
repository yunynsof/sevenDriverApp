import {Injectable} from '@angular/core';
import {Http} from '@angular/http';
import {Storage} from '@ionic/storage';
import 'rxjs/add/operator/toPromise';
import 'rxjs/add/observable/throw';
import {UserModel} from '../../models/user.model';
import {PassengerModel} from '../../models/passenger.model';
import {CredentialsModel} from '../../models/credentials.model';
import {JwtHelper, tokenNotExpired} from 'angular2-jwt';
import { Observable } from 'rxjs';
import *  as AppConfig from '../../app/config';

import { FcmProvider } from '../../providers/fcm/fcm';

import {Platform} from 'ionic-angular';


@Injectable()
export class AuthService {

  private cfg: any;
  idToken: string;
  refreshToken: string;
  refreshSubscription: any;


  constructor(
    private storage: Storage,
    private http: Http,
    private jwtHelper:JwtHelper,
    public fcm: FcmProvider,
    public platform: Platform) {

    this.cfg = AppConfig.cfg;
    this.storage.get('id_token').then(token => {
        this.idToken = token;
    });

    this.storage.get('refresh').then(refresh_token => {
      this.refreshToken = refresh_token;
  });

  }

  register(passengerData: PassengerModel) {
    console.log("Registring to: " + this.cfg.apiUrl + this.cfg.user.register)
    return this.http.post(this.cfg.apiUrl + this.cfg.user.register, passengerData)
      .toPromise()
      .then(data => {
        //this.saveData(data)
        let rs = data.json();
        console.log(JSON.stringify(rs));
        //this.idToken = rs.token;
        //this.scheduleRefresh();
      })
      .catch(e => console.log("reg error", e));


  }

  login(credentials: CredentialsModel) {

    return this.http.post(this.cfg.apiUrl + this.cfg.user.login, credentials)
      .toPromise()
      .then(data => {
          let rs = data.json();
         this.saveData(data);
         this.idToken = rs.access;
         this.refreshToken = rs.refresh;
         this.scheduleRefresh();         
      })
      .catch(e => {throw(e)});
  }


  saveData(data: any) {

    let rs = data.json();

    if(this.platform.is('cordova')) {
      // Get a FCM token
      this.fcm.getToken(this.jwtHelper.decodeToken(rs.access).user_id);
    }

    this.storage.set("user_id", this.jwtHelper.decodeToken(rs.access).user_id);
    this.storage.set("firstName", this.jwtHelper.decodeToken(rs.access).firstName);
    this.storage.set("lastName", this.jwtHelper.decodeToken(rs.access).lastName);
    this.storage.set("email", this.jwtHelper.decodeToken(rs.access).email);
    this.storage.set("id_token", rs.access);
    this.storage.set("refresh", rs.refresh);
  }

  logout() {
    // stop function of auto refesh
    this.unscheduleRefresh();
    
    this.fcm.removeTokenFromFirestore();
    this.storage.remove('user_id');
    this.storage.remove('firstName');
    this.storage.remove('lastName');
    this.storage.remove('email');
    this.storage.remove('id_token');
    this.storage.remove('refresh');

  }

  isValid() {
    return tokenNotExpired();
  }


  public getNewJwt() {
    console.log("Getting New Token");
     // Get a new JWT from Auth0 using the refresh token saved
     // in local storage
    this.storage.get("refresh").then((thetoken)=>{
      console.log("Refresh token saved: " + thetoken);     
      
      let  senddata: { refresh:string} = {
           refresh : thetoken
        };

        return this.http.post(this.cfg.apiUrl + this.cfg.user.refresh, senddata)
          .toPromise()
          .then(data => {            
            if(data.status == 200) {
              let rs = data.json();
              console.log("Old Token: " + thetoken);
              console.log("New Token: " + rs.access);
              this.storage.set("id_token", rs.access);
            }else{
              console.log("The Token Black Listed");
              this.logout();
            }
          })
          .catch(e => console.log('login error', e));
          

          /*
        this.http.get(this.cfg.apiUrl + this.cfg.user.refresh+"?Token="+thetoken)
         .map(res => res.json())
         .subscribe(res => {
           console.log(JSON.stringify(res));
           console.log(res.status);
           // If the API returned a successful response, mark the user as logged in
           // this need to be fixed on Laravel project to retun the New Token ;
            if(res.status == 'success') {
                   this.storage.set("id_token", res.token);

             } else {
               console.log("The Token Black Listed");
               this.logout();

            }
         }, err => {
           console.error('ERROR', err);
          });*/

       });

   }


  public scheduleRefresh() {
  // If the user is authenticated, use the token stream
  // provided by angular2-jwt and flatMap the token

  let source = Observable.of(this.idToken).flatMap(
    token => {
      // The delay to generate in this case is the difference
      // between the expiry time and the issued at time
      let jwtIat = this.jwtHelper.decodeToken(token).iat;
      let jwtExp = this.jwtHelper.decodeToken(token).exp;
      let iat = new Date(0);
      let exp = new Date(0);

      let delay = (exp.setUTCSeconds(jwtExp) - iat.setUTCSeconds(jwtIat));
      console.log(delay);
      console.log("will start refresh after :",(delay/1000)/60);
      if(delay-1000<=0)
      delay = 1;
      //return Observable.interval(6000); // Set For Testing 7200 ms
      return Observable.interval(delay);
    });

  this.refreshSubscription = source.subscribe(() => {
    this.getNewJwt();
  });
}



public startupTokenRefresh() {
    // If the user is authenticated, use the token stream
    // provided by angular2-jwt and flatMap the token

    this.storage.get("id_token").then((thetoken)=>{

      if(thetoken){

        let source = Observable.of(thetoken).flatMap(
          token => {
            // Get the expiry time to generate
            // a delay in milliseconds
            let now: number = new Date().valueOf();
            let jwtExp: number = this.jwtHelper.decodeToken(token).exp;
            let exp: Date = new Date(0);
            exp.setUTCSeconds(jwtExp);
            let delay: number = exp.valueOf() - now;

            if(delay <= 0) {
              delay=1;
            }
             // Use the delay in a timer to
            // run the refresh at the proper time
            return Observable.timer(delay);
          });

         // Once the delay time from above is
         // reached, get a new JWT and schedule
         // additional refreshes
         source.subscribe(() => {
           this.getNewJwt();
           this.scheduleRefresh();
         });

      }else{
        //there is no user logined
        console.info("there is no user logined ");

      }

    });


    }




public unscheduleRefresh() {
// Unsubscribe fromt the refresh
if (this.refreshSubscription) {
this.refreshSubscription.unsubscribe();
}
}

}
