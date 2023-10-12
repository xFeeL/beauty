import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AddServicesPage } from './add-services.page';

const routes: Routes = [
  {
    path: '',
    component: AddServicesPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AddServicesPageRoutingModule {}
