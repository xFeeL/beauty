import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AutomatedNotificationsPageRoutingModule } from './automated-notifications-routing.module';

import { AutomatedNotificationsPage } from './automated-notifications.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AutomatedNotificationsPageRoutingModule
  ],
  declarations: [AutomatedNotificationsPage]
})
export class AutomatedNotificationsPageModule {}
