import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TeamServicesPageRoutingModule } from './team-services-routing.module';

import { TeamServicesPage } from './team-services.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TeamServicesPageRoutingModule
  ],
  declarations: [TeamServicesPage]
})
export class TeamServicesPageModule {}
