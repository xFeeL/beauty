import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AddServicesPageRoutingModule } from './add-services-routing.module';

import { AddServicesPage } from './add-services.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AddServicesPageRoutingModule
  ],
  declarations: [AddServicesPage]
})
export class AddServicesPageModule {}
