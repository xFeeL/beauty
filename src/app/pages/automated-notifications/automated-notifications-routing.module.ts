import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AutomatedNotificationsPage } from './automated-notifications.page';

const routes: Routes = [
  {
    path: '',
    component: AutomatedNotificationsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AutomatedNotificationsPageRoutingModule {}
