import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { InstagramImagesPageRoutingModule } from './instagram-images-routing.module';

import { InstagramImagesPage } from './instagram-images.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    InstagramImagesPageRoutingModule
  ],
  declarations: [InstagramImagesPage]
})
export class InstagramImagesPageModule {}
