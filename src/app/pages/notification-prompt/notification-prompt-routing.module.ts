import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { NotificationPromptPage } from './notification-prompt.page';

const routes: Routes = [
  {
    path: '',
    component: NotificationPromptPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class NotificationPromptPageRoutingModule {}
