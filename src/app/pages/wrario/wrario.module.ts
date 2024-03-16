import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { IonicModule } from '@ionic/angular';

import { WrarioPageRoutingModule } from './wrario-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { WrarioPage } from './wrario.page';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';

import { MatTooltipModule } from '@angular/material/tooltip';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MatFormFieldModule,
    MatSelectModule,
    MatIconModule,
    MatTooltipModule,
    ReactiveFormsModule,
    WrarioPageRoutingModule
  ],
  declarations: [WrarioPage]
})
export class WrarioPageModule {}
