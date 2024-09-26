import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { KrathseisPageRoutingModule } from './krathseis-routing.module';

import { KrathseisPage } from './krathseis.page';
import { DateFormatPipe } from 'src/app/date-format.pipe'; // Adjust the import path as necessary
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MatIconModule,
    MatMenuModule,
    MatButtonModule,
    MatTooltipModule,
    KrathseisPageRoutingModule
  ],
  declarations: [KrathseisPage, DateFormatPipe ]
})
export class KrathseisPageModule {}
