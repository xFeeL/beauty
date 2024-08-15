import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TeamServicesPromptPage } from './team-services-prompt.page';

const routes: Routes = [
  {
    path: '',
    component: TeamServicesPromptPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TeamServicesPromptPageRoutingModule {}
