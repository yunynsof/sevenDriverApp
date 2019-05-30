import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument  } from 'angularfire2/firestore';
import { Ride } from '../../models/ride.model';

/*
  Generated class for the FirestoreProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class FirestoreProvider {

  rides;

  constructor(public http: HttpClient, public firestore: AngularFirestore) {
    console.log('Hello FirestoreProvider Provider');
    this.rides = firestore.collection<Ride>(`rides`);
  }

  getRide(docId: string): AngularFirestoreDocument<Ride> {
    console.log("Getting Ride of user");
    return this.firestore.collection(`rides`).doc(docId);
  }

  getRides(): AngularFirestoreCollection<Ride> {
    return this.firestore.collection(`rides`, ref => ref.orderBy('requestedAt', 'asc').where("status", "==", 1));
  }

  addRide(){

    let ride = {
      passengerId: "1",
      passengerName: "AppTest",
      driverId: "",
      driverName: "",
      vehicleId: "",
      startLatitude: "14",
      startLongitude: "-87",
      endLatitude: "14",
      endLongitude: "-87",
      baggage: "no",
      status: "passengerRequest",
      fee: "100.00",
      cancelationReason: "",
      numberOfPassengers: "1",
      requestedAt: "9:00",
      updatedAt: ""
   };

    this.rides.add(ride);
  }

  confirmRide(){

  }
  

}
