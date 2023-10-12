import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { KrathshPage } from './krathsh.page';

const routes: Routes = [
  {
    path: '',
    component: KrathshPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class KrathshPageRoutingModule {}
