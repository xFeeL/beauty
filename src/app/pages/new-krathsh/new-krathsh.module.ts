import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { NewKrathshPageRoutingModule } from './new-krathsh-routing.module';

import { NewKrathshPage } from './new-krathsh.page';
import {MatChipsModule} from '@angular/material/chips'; 
import {MatIconModule} from '@angular/material/icon';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import { MaskitoModule } from '@maskito/angular';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MatIconModule,
    MatButtonToggleModule,
    MatChipsModule,
    MaskitoModule,
    NewKrathshPageRoutingModule
  ],
  declarations: [NewKrathshPage]
})
export class NewKrathshPageModule {}
