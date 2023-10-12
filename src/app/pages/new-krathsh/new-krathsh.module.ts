import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { NewKrathshPageRoutingModule } from './new-krathsh-routing.module';

import { NewKrathshPage } from './new-krathsh.page';
import {MatChipsModule} from '@angular/material/chips'; 
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MatChipsModule,
    NewKrathshPageRoutingModule
  ],
  declarations: [NewKrathshPage]
})
export class NewKrathshPageModule {}
