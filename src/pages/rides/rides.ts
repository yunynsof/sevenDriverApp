import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

import { Observable } from 'rxjs';
import { Ride } from '../../models/ride.model';
import { FirestoreProvider } from '../../providers/firestore/firestore';



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

  public title:any;

  constructor(public navCtrl: NavController, public navParams: NavParams, private firestoreProvider :FirestoreProvider) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad RidesPage');
    this.rides = this.firestoreProvider.getRides().valueChanges();
    this.firestoreProvider.getRides().snapshotChanges()
     .subscribe(c => {
        this.title = "Carreras Disponibles ("+c.length+")";
     });
  }

}
