import {Component} from '@angular/core';
import {IonicPage, NavController, NavParams, MenuController} from 'ionic-angular';
import {Storage} from '@ionic/storage';
import {Validators, FormBuilder, FormGroup} from '@angular/forms';
import {AuthService} from '../../providers/auth-service/auth-service';

import {UserModel} from '../../models/user.model';

import {PassengerModel} from '../../models/passenger.model';

import { HomePage } from '../../pages/home/home';

import { ProfilePage } from '../../pages/profile/profile';

import { Events } from 'ionic-angular';

import { Geolocation } from '@ionic-native/geolocation';


@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class LoginPage {

  private loginData: FormGroup;
  public user: UserModel;
  public passenger: PassengerModel;
  public backgroundImage = 'assets/img/background/background-7.jpg';

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public menuCtrl: MenuController,
    public storage: Storage,
    public formBuilder: FormBuilder,
    public authService: AuthService,
    public events: Events, 
    private geolocation: Geolocation) {

    this.loginData = this.formBuilder.group({
      username: ['', Validators.compose([Validators.required])],
      password: ['', Validators.compose([Validators.required, Validators.minLength(6)])],
    });
  }

  ionViewDidLoad() {
    //hide menu when on the login page, regardless of the screen resolution
    this.menuCtrl.enable(false);
    this.geolocation.getCurrentPosition().then((resp) => {});
  }

  register(){
    //this.passenger.email = "Correo";
    //this.passenger.identifier = "080182093213";

    this.passenger = new PassengerModel("94950000", "080119861775111" ,"mmzepedab@hotmail.com", "Mario", "Zepeda", "Q1w2e3r4t5@");
    this.authService.register(this.passenger);

    console.log(JSON.stringify(this.passenger));


  }

  login() {
    //use this.loginData.value to authenticate the user
    this.authService.login(this.loginData.value)
      .then(() => this.redirectToHome())
      .catch((error: any) => {
        if (error.status === 500) {
            console.log("Error 500");            ;
        }
        else if (error.status === 400) {
            console.log("Error 400");
        }
        else if (error.status === 409) {
          console.log("Error 409");
        }
        else if (error.status === 406) {
          console.log("Error 406");
        }
    });
  }

  redirectToHome() {
    this.events.publish('user:created');
    this.navCtrl.setRoot(ProfilePage);
    this.menuCtrl.enable(true);
  }

  /**
   * Opens a paage
   * 
   * @param page string Page name
   */
  openPage(page: string) {
    this.navCtrl.push(page);
  }
}
