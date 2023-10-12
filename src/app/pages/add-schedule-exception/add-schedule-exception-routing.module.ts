import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AddScheduleExceptionPage } from './add-schedule-exception.page';

const routes: Routes = [
  {
    path: '',
    component: AddScheduleExceptionPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AddScheduleExceptionPageRoutingModule {}
