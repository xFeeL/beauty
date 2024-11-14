import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { NotificationPromptPageRoutingModule } from './notification-prompt-routing.module';

import { NotificationPromptPage } from './notification-prompt.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    NotificationPromptPageRoutingModule
  ],
  declarations: [NotificationPromptPage]
})
export class NotificationPromptPageModule {}
