import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SmsPurchasePage } from './sms-purchase.page';

const routes: Routes = [
  {
    path: '',
    component: SmsPurchasePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SmsPurchasePageRoutingModule {}
