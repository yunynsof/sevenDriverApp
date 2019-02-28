import {Component} from '@angular/core';
import {IonicPage, NavController, NavParams, MenuController} from 'ionic-angular';
import {Storage} from '@ionic/storage';
import {Validators, FormBuilder, FormGroup} from '@angular/forms';
import {AuthService} from '../../providers/auth-service/auth-service';

import {UserModel} from '../../models/user.model';

import { HomePage } from '../../pages/home/home';

import { ProfilePage } from '../../pages/profile/profile';

import { Events } from 'ionic-angular';


@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class LoginPage {

  private loginData: FormGroup;
  public user: UserModel;
  public backgroundImage = 'assets/img/background/background-7.jpg';

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public menuCtrl: MenuController,
    public storage: Storage,
    public formBuilder: FormBuilder,
    public authService: AuthService,
    public events: Events) {

    this.loginData = this.formBuilder.group({
      username: ['', Validators.compose([Validators.required])],
      password: ['', Validators.compose([Validators.required, Validators.minLength(6)])],
    });
  }

  ionViewDidLoad() {
    //hide menu when on the login page, regardless of the screen resolution
    this.menuCtrl.enable(false);
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
