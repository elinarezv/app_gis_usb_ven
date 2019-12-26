import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ThreatMapPageRoutingModule } from './threat-map-routing.module';

import { ThreatMapPage } from './threat-map.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ThreatMapPageRoutingModule
  ],
  declarations: [ThreatMapPage]
})
export class ThreatMapPageModule {}
