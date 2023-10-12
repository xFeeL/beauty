import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AddScheduleExceptionPageRoutingModule } from './add-schedule-exception-routing.module';

import { AddScheduleExceptionPage } from './add-schedule-exception.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AddScheduleExceptionPageRoutingModule
  ],
  declarations: [AddScheduleExceptionPage]
})
export class AddScheduleExceptionPageModule {}
