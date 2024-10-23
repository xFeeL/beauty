import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SmsPurchasePageRoutingModule } from './sms-purchase-routing.module';

import { SmsPurchasePage } from './sms-purchase.page';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule,
    MatFormFieldModule,  // Import Angular Material form field module
    MatInputModule, 
    SmsPurchasePageRoutingModule
  ],
  declarations: [SmsPurchasePage]
})
export class SmsPurchasePageModule {}
