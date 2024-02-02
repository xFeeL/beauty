import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ChooseVariationPage } from './choose-variation.page';

const routes: Routes = [
  {
    path: '',
    component: ChooseVariationPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ChooseVariationPageRoutingModule {}
