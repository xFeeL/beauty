import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ReservationSettingsPageRoutingModule } from './reservation-settings-routing.module';

import { ReservationSettingsPage } from './reservation-settings.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReservationSettingsPageRoutingModule
  ],
  declarations: [ReservationSettingsPage]
})
export class ReservationSettingsPageModule {}
