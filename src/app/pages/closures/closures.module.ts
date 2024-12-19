import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { IonicModule } from '@ionic/angular';

import { ClosuresPageRoutingModule } from './closures-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { ClosuresPage } from './closures.page';
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
    ClosuresPageRoutingModule
  ],
  declarations: [ClosuresPage]
})
export class ClosuresPageModule {}
