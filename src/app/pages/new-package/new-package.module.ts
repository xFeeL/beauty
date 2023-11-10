import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { NewPackagePageRoutingModule } from './new-package-routing.module';

import { NewPackagePage } from './new-package.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    NewPackagePageRoutingModule
  ],
  declarations: [NewPackagePage]
})
export class NewPackagePageModule {}
