import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { EditAutomaticNotificationPage } from './edit-automatic-notification.page';

const routes: Routes = [
  {
    path: '',
    component: EditAutomaticNotificationPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EditAutomaticNotificationPageRoutingModule {}
