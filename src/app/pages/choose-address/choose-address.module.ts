import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ChooseAddressPageRoutingModule } from './choose-address-routing.module';

import { ChooseAddressPage } from './choose-address.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ChooseAddressPageRoutingModule
  ],
  declarations: [ChooseAddressPage]
})
export class ChooseAddressPageModule {}
