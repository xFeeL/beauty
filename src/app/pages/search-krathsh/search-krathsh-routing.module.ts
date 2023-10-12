import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SearchKrathshPage } from './search-krathsh.page';

const routes: Routes = [
  {
    path: '',
    component: SearchKrathshPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SearchKrathshPageRoutingModule {}
