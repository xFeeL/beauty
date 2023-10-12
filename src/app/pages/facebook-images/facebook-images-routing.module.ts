import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { FacebookImagesPage } from './facebook-images.page';

const routes: Routes = [
  {
    path: '',
    component: FacebookImagesPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FacebookImagesPageRoutingModule {}
