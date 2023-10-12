import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ChatPageRoutingModule } from './chat-routing.module';

import { ChatPage } from './chat.page';
import { GalleryModule } from  'ng-gallery';
import { LightboxModule } from  'ng-gallery/lightbox';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    GalleryModule,
    LightboxModule,
    ChatPageRoutingModule
  ],
  declarations: [ChatPage]
})
export class ChatPageModule {}
