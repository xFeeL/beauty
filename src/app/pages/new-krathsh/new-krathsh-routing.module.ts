import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { NewKrathshPage } from './new-krathsh.page';

const routes: Routes = [
  {
    path: '',
    component: NewKrathshPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class NewKrathshPageRoutingModule {}
