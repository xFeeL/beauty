import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SearchKrathshPageRoutingModule } from './search-krathsh-routing.module';

import { SearchKrathshPage } from './search-krathsh.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SearchKrathshPageRoutingModule
  ],
  declarations: [SearchKrathshPage]
})
export class SearchKrathshPageModule {}
