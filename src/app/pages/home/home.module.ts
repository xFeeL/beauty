import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { HomePageRoutingModule } from './home-routing.module';

import { HomePage } from './home.page';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatMenuModule } from '@angular/material/menu';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import {MatIconModule} from '@angular/material/icon'; 
import { NgChartsModule } from 'ng2-charts';
import {MatButtonModule} from '@angular/material/button';
import {MatDialogModule} from '@angular/material/dialog'; 
import {MatCheckboxModule} from '@angular/material/checkbox';
import { MatBadgeModule } from '@angular/material/badge';
import {MatSelectModule} from '@angular/material/select';
import {MatInputModule} from '@angular/material/input';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MatChipsModule,
    HomePageRoutingModule,
    MatTableModule,
    MatMenuModule,
    MatIconModule,
    NgChartsModule,
    MatButtonModule,
    MatDialogModule,
    MatTooltipModule,
    MatCheckboxModule,
    MatBadgeModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
  ],
  declarations: [HomePage]
})
export class HomePageModule {}
