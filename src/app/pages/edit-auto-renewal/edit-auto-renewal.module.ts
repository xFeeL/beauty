import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { EditAutoRenewalPageRoutingModule } from './edit-auto-renewal-routing.module';

import { EditAutoRenewalPage } from './edit-auto-renewal.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    EditAutoRenewalPageRoutingModule
  ],
  declarations: [EditAutoRenewalPage]
})
export class EditAutoRenewalPageModule {}
