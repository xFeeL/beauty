import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TeamServicesPageRoutingModule } from './team-services-routing.module';

import { TeamServicesPage } from './team-services.page';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MatMenuModule,
    MatIconModule,
    
    TeamServicesPageRoutingModule
  ],
  declarations: [TeamServicesPage]
})
export class TeamServicesPageModule {}
