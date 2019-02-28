import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ProfilePage } from './profile';
import { StarRatingModule } from 'ionic3-star-rating';


@NgModule({
  declarations: [
    ProfilePage,
  ],
  imports: [
    StarRatingModule,
    IonicPageModule.forChild(ProfilePage),
  ],
  exports: [
    ProfilePage
  ]
})
export class ProfilePageModule {}
