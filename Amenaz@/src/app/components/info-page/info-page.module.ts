import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { InfoPageComponent } from './info-page.component';

@NgModule({
  declarations: [InfoPageComponent],
  imports: [CommonModule, FormsModule, IonicModule],
  exports: [InfoPageComponent]
})
export class InfoPageModule {}
