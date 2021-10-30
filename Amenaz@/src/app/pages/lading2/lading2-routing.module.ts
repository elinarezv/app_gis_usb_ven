import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { Lading2Page } from './lading2.page';

const routes: Routes = [
  {
    path: '',
    component: Lading2Page
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class Lading2PageRoutingModule {}
