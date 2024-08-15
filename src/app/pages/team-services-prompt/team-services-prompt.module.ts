import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TeamServicesPromptPageRoutingModule } from './team-services-prompt-routing.module';

import { TeamServicesPromptPage } from './team-services-prompt.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TeamServicesPromptPageRoutingModule
  ],
  declarations: [TeamServicesPromptPage]
})
export class TeamServicesPromptPageModule {}
