import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { AngularFirestore, AngularFirestoreCollection  } from 'angularfire2/firestore';
import { Ride } from '../../models/ride.model';

/*
  Generated class for the FirestoreProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class FirestoreProvider {

  constructor(public http: HttpClient, public firestore: AngularFirestore) {
    console.log('Hello FirestoreProvider Provider');
  }

  getRides(): AngularFirestoreCollection<Ride> {
    return this.firestore.collection(`rides`, ref => ref.orderBy('requestedAt', 'asc').where("status", "==", "passengerRequest"));
  }
  

}
