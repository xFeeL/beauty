import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { InstagramImagesPage } from './instagram-images.page';

const routes: Routes = [
  {
    path: '',
    component: InstagramImagesPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class InstagramImagesPageRoutingModule {}
