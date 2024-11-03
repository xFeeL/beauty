import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ChargesPage } from './charges.page';

const routes: Routes = [
  {
    path: '',
    component: ChargesPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ChargesPageRoutingModule {}
