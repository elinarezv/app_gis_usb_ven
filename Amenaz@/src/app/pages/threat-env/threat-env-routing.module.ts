import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ThreatEnvPage } from './threat-env.page';

const routes: Routes = [
  {
    path: '',
    component: ThreatEnvPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ThreatEnvPageRoutingModule {}
