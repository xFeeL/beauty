import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TeamServicesPage } from './team-services.page';

const routes: Routes = [
  {
    path: '',
    component: TeamServicesPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TeamServicesPageRoutingModule {}
