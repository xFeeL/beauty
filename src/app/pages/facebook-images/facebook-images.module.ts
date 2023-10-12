import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { FacebookImagesPageRoutingModule } from './facebook-images-routing.module';

import { FacebookImagesPage } from './facebook-images.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    FacebookImagesPageRoutingModule
  ],
  declarations: [FacebookImagesPage]
})
export class FacebookImagesPageModule {}
