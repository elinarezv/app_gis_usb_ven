import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CityPageRoutingModule } from './city-routing.module';

import { CityPage } from './city.page';
import { InfoPageModule } from 'src/app/components/info-page/info-page.module';
import { InfoPageComponent } from 'src/app/components/info-page/info-page.component';
import { LegendComponent } from 'src/app/components/legend/legend.component';

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, CityPageRoutingModule, InfoPageModule],
  declarations: [CityPage, LegendComponent],
  entryComponents: [InfoPageComponent, LegendComponent]
})
export class CityPageModule {}
