import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { KrathshPageRoutingModule } from './krathsh-routing.module';

import { KrathshPage } from './krathsh.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    KrathshPageRoutingModule
  ],
  declarations: [KrathshPage]
})
export class KrathshPageModule {}
