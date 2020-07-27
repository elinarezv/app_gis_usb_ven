import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IonRadioGroup } from '@ionic/angular';

import { AuthService } from '../../services/auth.service';
import { AlertService } from '../../services/alert.service';
import { NavController } from '@ionic/angular';
import { MappingService } from 'src/app/services/mapping.service';

import * as L from 'leaflet';
import * as esri from 'esri-leaflet';
import { EnvService } from 'src/app/services/env.service';

@Component({
  selector: 'app-myaccount',
  templateUrl: './myaccount.page.html',
  styleUrls: ['./myaccount.page.scss'],
})
export class MyaccountPage implements OnInit {
  @ViewChild('basemapRadioGroup', { static: true }) radioGroup: IonRadioGroup;

  public accountForm: FormGroup;
  public submitAttempt: boolean = false;
  public formDataChanged: boolean = false;

  constructor(public formBuilder: FormBuilder, private mappingService: MappingService, private env: EnvService) {}

  setBaseMap(baseMapName: string) {
    this.mappingService.map.removeLayer(this.mappingService.baseMap);
    if (this.mappingService.baseMapLabels) {
      this.mappingService.map.removeLayer(this.mappingService.baseMapLabels);
    }
    if (baseMapName === 'esri-vial') {
      if (this.env.USE_ESRI_BASEMAPS) {
        this.mappingService.baseMap = esri.basemapLayer('Streets');
        this.mappingService.baseMapLabels = null;
      } else {
        const urlMap = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}';
        this.mappingService.baseMap = L.tileLayer(urlMap, {
          id: 'mapId',
          attribution: 'www.usb.ve Licencia GPLv3 y CC',
          maxZoom: 16,
        });
      }
      this.mappingService.baseMapName = 'esri-vial';
    } else if (baseMapName === 'esri-sat') {
      if (this.env.USE_ESRI_BASEMAPS) {
        this.mappingService.baseMap = esri.basemapLayer('Imagery');
        this.mappingService.baseMapLabels = esri.basemapLayer('ImageryLabels');
      } else {
        this.mappingService.baseMap = L.tileLayer(
          'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
          {
            id: 'mapId',
            attribution: 'www.usb.ve Licencia GPLv3 y CC',
            maxZoom: 16,
          }
        );
      }
      this.mappingService.baseMapName = 'esri-sat';
    } else {
      if (this.env.USE_ESRI_BASEMAPS) {
        this.mappingService.baseMap = esri.basemapLayer('DarkGray');
        this.mappingService.baseMapLabels = esri.basemapLayer('DarkGrayLabels');
      } else {
        this.mappingService.baseMap = L.tileLayer(
          'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
          {
            id: 'mapId',
            attribution: 'www.usb.ve Licencia GPLv3 y CC',
            maxZoom: 16,
          }
        );
      }
      this.mappingService.baseMapName = 'esri-dark';
    }
  }
  formChanged() {
    this.formDataChanged = true;
  }
  ngOnInit() {}
  ionViewDidEnter() {
    this.radioGroup.value = this.mappingService.baseMapName;
  }
}
