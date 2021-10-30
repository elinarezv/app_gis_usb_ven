import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { Lading2PageRoutingModule } from './lading2-routing.module';

import { Lading2Page } from './lading2.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    Lading2PageRoutingModule
  ],
  declarations: [Lading2Page]
})
export class Lading2PageModule {}
