import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ThreatEnvPageRoutingModule } from './threat-env-routing.module';

import { ThreatEnvPage } from './threat-env.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ThreatEnvPageRoutingModule
  ],
  declarations: [ThreatEnvPage]
})
export class ThreatEnvPageModule {}
