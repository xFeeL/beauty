import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { NewPackagePage } from './new-package.page';

const routes: Routes = [
  {
    path: '',
    component: NewPackagePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class NewPackagePageRoutingModule {}
