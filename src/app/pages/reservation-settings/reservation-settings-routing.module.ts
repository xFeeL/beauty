import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ReservationSettingsPage } from './reservation-settings.page';

const routes: Routes = [
  {
    path: '',
    component: ReservationSettingsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ReservationSettingsPageRoutingModule {}
