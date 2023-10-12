import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { KrathseisPage } from './krathseis.page';

const routes: Routes = [
  {
    path: '',
    component: KrathseisPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class KrathseisPageRoutingModule {}
