import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { WrarioPage } from './wrario.page';

const routes: Routes = [
  {
    path: '',
    component: WrarioPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class WrarioPageRoutingModule {}
