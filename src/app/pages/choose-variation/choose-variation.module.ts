import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ChooseVariationPageRoutingModule } from './choose-variation-routing.module';

import { ChooseVariationPage } from './choose-variation.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ChooseVariationPageRoutingModule
  ],
  declarations: [ChooseVariationPage]
})
export class ChooseVariationPageModule {}
