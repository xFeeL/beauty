import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PwaInstallationPageRoutingModule } from './pwa-installation-routing.module';

import { PwaInstallationPage } from './pwa-installation.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PwaInstallationPageRoutingModule
  ],
  declarations: [PwaInstallationPage]
})
export class PwaInstallationPageModule {}
