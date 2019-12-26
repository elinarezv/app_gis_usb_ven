import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MyaccountPage } from './myaccount.page';

const routes: Routes = [
  {
    path: '',
    component: MyaccountPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MyaccountPageRoutingModule {}
