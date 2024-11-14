import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PwaInstallationPage } from './pwa-installation.page';

const routes: Routes = [
  {
    path: '',
    component: PwaInstallationPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PwaInstallationPageRoutingModule {}
