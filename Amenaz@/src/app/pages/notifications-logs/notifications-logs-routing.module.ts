import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { NotificationsLogsPage } from './notifications-logs.page';

const routes: Routes = [
  {
    path: '',
    component: NotificationsLogsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class NotificationsLogsPageRoutingModule {}
