import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ThreatMapPage } from './threat-map.page';

const routes: Routes = [
  {
    path: '',
    component: ThreatMapPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ThreatMapPageRoutingModule {}
