import { Injectable } from '@angular/core';
import { Firebase } from '@ionic-native/firebase';
import { Platform } from 'ionic-angular';
import { AngularFirestore } from 'angularfire2/firestore';

import { Device } from '@ionic-native/device';
@Injectable()
export class FcmProvider {

  constructor(
    public firebaseNative: Firebase,
    public afs: AngularFirestore,
    private platform: Platform,
    private device: Device
  ) { }

  async getToken(userId) {

    let token;

    if (this.platform.is('android')) {
      token = await this.firebaseNative.getToken()
    }

    if (this.platform.is('ios')) {
      token = await this.firebaseNative.getToken();
      await this.firebaseNative.grantPermission();
    }

    return this.saveTokenToFirestore(token, userId)
  }

  private saveTokenToFirestore(token, userId) {
    if (!token) return;

    console.log('Device UUID is: ' + this.device.uuid);

    const devicesRef = this.afs.collection('devices')

    const docData = {
      token,
      userId: userId,
      deviceId: this.device.uuid
    }

    return devicesRef.doc(this.device.uuid).set(docData);
  }


  public removeTokenFromFirestore() {
    console.log('Revoking Device UUID from Firestore: ' + this.device.uuid);
    const devicesRef = this.afs.collection('devices');
    if(this.device.uuid){
      devicesRef.doc(this.device.uuid).delete();
    }
  }

  //Another way to remove from firestore using promises
  /*
  public removeTokenFromFirestore(userId) {
    console.log("Removing Token with userId doc: " + userId);
    const devicesRef = this.afs.collection('devices', ref => ref.where('userId', '==', userId));
    console.log("Collection ref to remove: " + devicesRef);
    var docId = devicesRef.snapshotChanges().map(changes => {
      return changes.map(a => {
        //const data = a.payload.doc.data() as Country;
        const id = a.payload.doc.id;
        console.log("Deleting doc: " + id);
        this.afs.collection('devices').doc(id).delete();

        return { id };
      });
    });

    docId.subscribe(docs => {
      docs.forEach(doc => {
        console.log(doc.id);
      })
    })

  }
  */

  listenToNotifications() {
    return this.firebaseNative.onNotificationOpen()
  }

}