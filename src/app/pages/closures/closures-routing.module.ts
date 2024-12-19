import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ClosuresPage } from './closures.page';

const routes: Routes = [
  {
    path: '',
    component: ClosuresPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ClosuresPageRoutingModule {}
