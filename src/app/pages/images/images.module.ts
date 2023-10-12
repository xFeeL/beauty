import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ImagesPageRoutingModule } from './images-routing.module';

import { ImagesPage } from './images.page';
import { GalleryModule } from  'ng-gallery';
import { LightboxModule } from  'ng-gallery/lightbox';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    GalleryModule,
    LightboxModule,
    ImagesPageRoutingModule
  ],
  declarations: [ImagesPage]
})
export class ImagesPageModule {}
