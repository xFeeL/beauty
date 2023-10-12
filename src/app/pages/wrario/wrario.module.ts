import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { WrarioPageRoutingModule } from './wrario-routing.module';

import { WrarioPage } from './wrario.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    WrarioPageRoutingModule
  ],
  declarations: [WrarioPage]
})
export class WrarioPageModule {}
