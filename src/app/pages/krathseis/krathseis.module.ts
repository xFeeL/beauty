import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { KrathseisPageRoutingModule } from './krathseis-routing.module';

import { KrathseisPage } from './krathseis.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    KrathseisPageRoutingModule
  ],
  declarations: [KrathseisPage]
})
export class KrathseisPageModule {}
