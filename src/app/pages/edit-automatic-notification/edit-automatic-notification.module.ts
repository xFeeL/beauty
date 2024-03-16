import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { EditAutomaticNotificationPageRoutingModule } from './edit-automatic-notification-routing.module';

import { EditAutomaticNotificationPage } from './edit-automatic-notification.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    EditAutomaticNotificationPageRoutingModule
  ],
  declarations: [EditAutomaticNotificationPage]
})
export class EditAutomaticNotificationPageModule {}
