import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { EditAutoRenewalPage } from './edit-auto-renewal.page';

const routes: Routes = [
  {
    path: '',
    component: EditAutoRenewalPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EditAutoRenewalPageRoutingModule {}
