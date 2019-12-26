import { Component, OnInit } from '@angular/core';
import { MenuController, NavController } from '@ionic/angular';
import { Map, tileLayer, Layer, control, marker, icon, geoJSON } from 'leaflet';
import { AuthService } from 'src/app/services/auth.service';
import { AlertService } from 'src/app/services/alert.service';
import { MappingService } from 'src/app/services/mapping.service';
import { Platform } from '@ionic/angular';
import { Router } from '@angular/router';
import { map } from 'rxjs/operators';
import { observable } from 'rxjs';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss']
})
export class HomePage implements OnInit {
  map: Map;
  addedLayerControl: boolean;

  constructor(
    private menu: MenuController,
    private navCtrl: NavController,
    private authService: AuthService,
    private alertService: AlertService,
    private mappingService: MappingService
  ) {
    this.menu.enable(true);
    this.addedLayerControl = false;
  }
  ionViewDidEnter() {
    this.mainScreenMap();
  }
  allowLayerControl() {
    if (
      this.mappingService.urbanArea &&
      this.mappingService.urbanPoly &&
      this.mappingService.albarregasPZ &&
      this.mappingService.meridaPolitical
    ) {
      return true;
    }
    return false;
  }
  addLayertoMap(layerName: string, color: string) {
    this.authService.getLayer(layerName).subscribe(
      (result: any) => {
        const var1 = geoJSON(result, {
          style: {
            color: color,
            weight: 2,
            opacity: 0.65
          }
        });
        switch (layerName) {
          case 'a_urbana_geojson':
            this.mappingService.urbanArea = var1;
            break;
          case 'polg_urbana_geojson':
            this.mappingService.urbanPoly = var1;
            break;
          case 'zpr_albarregas_geojson':
            this.mappingService.albarregasPZ = var1;
            break;
          case 'pquias_libertador_geojson':
            this.mappingService.meridaPolitical = var1;
            break;
        }
      },
      error => {
        console.log(error);
      },
      () => {
        console.log('Add to map');
      }
    );
  }
  addLayers2MainMap() {
    if (!this.mappingService.urbanArea) {
      this.addLayertoMap('a_urbana_geojson', '#ff3300');
    }
    if (!this.mappingService.urbanPoly) {
      this.addLayertoMap('polg_urbana_geojson', '#ccff33');
    }
    if (!this.mappingService.meridaPolitical) {
      this.addLayertoMap('pquias_libertador_geojson', '#33cc33');
    }
    if (!this.mappingService.albarregasPZ) {
      this.addLayertoMap('zpr_albarregas_geojson', '#0000ff');
    }
  }
  mainScreenMap() {
    // Center Map on Venezuela
    this.map = new Map('mapId').setView([8.031, -65.346], 5);
    this.mappingService.mainCityMarker.addTo(this.map);

    // Add all non-thread layers
    this.addLayers2MainMap();
    this.mappingService.baseMap.addTo(this.map);
  }
  centerOnCity() {
    this.map.flyTo(this.mappingService.mainCity, 12);
    if (this.allowLayerControl() && !this.addedLayerControl) {
      const overlayMaps = {
        'Área urbana': this.mappingService.urbanArea,
        'Poligonal urbana': this.mappingService.urbanPoly,
        'Zona Prot. Río Albarregas': this.mappingService.albarregasPZ,
        'Parroquias Libertador': this.mappingService.meridaPolitical
      };
      control.layers(null, overlayMaps).addTo(this.map);
      this.addedLayerControl = true;
    }
  }
  ThreadEnv() {
    this.navCtrl.navigateForward('/threat-env');
  }
  ThreadMap() {
    this.navCtrl.navigateForward('/threat-map');
  }
  ionViewWillLeave() {
    this.addedLayerControl = false;
    this.map.remove();
  }
  ngOnInit() {}
}
