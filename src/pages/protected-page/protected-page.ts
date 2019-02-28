import {NavController, NavParams} from 'ionic-angular';
import {Storage} from '@ionic/storage';

import { LoginPage } from '../../pages/login/login';

export class ProtectedPage {

  constructor(
    public navCtrl: NavController,
    public storage: Storage) {
  }

  ionViewCanEnter() {
    console.log("ionViewCanEnter Protected Page");
    
    this.storage.get('id_token').then(id_token => {
      console.log(id_token);
      if (id_token === null) {
        this.navCtrl.setRoot(LoginPage);
        return false;
      }
    });

    return true;
  }
}
