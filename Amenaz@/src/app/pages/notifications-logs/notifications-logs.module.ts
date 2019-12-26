import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { NotificationsLogsPageRoutingModule } from './notifications-logs-routing.module';

import { NotificationsLogsPage } from './notifications-logs.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    NotificationsLogsPageRoutingModule
  ],
  declarations: [NotificationsLogsPage]
})
export class NotificationsLogsPageModule {}
