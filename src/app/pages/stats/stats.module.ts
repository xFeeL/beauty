import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { StatsPageRoutingModule } from './stats-routing.module';

import { StatsPage } from './stats.page';
import {MatIconModule} from '@angular/material/icon'; 
import { NgChartsModule } from 'ng2-charts';
import { MatMenuModule } from '@angular/material/menu';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    NgChartsModule,
    MatMenuModule,
    IonicModule,
    
    StatsPageRoutingModule
  ],
  declarations: [StatsPage]
})
export class StatsPageModule {}
