import { Component, OnInit } from '@angular/core';
import { MenuController, NavController } from '@ionic/angular';
import { Map, tileLayer, Layer, control, marker, icon, geoJSON } from 'leaflet';
import { AuthService } from 'src/app/services/auth.service';
import { AlertService } from 'src/app/services/alert.service';
import { MappingService } from 'src/app/services/mapping.service';

@Component({
  selector: 'app-threat-map',
  templateUrl: './threat-map.page.html',
  styleUrls: ['./threat-map.page.scss']
})
export class ThreatMapPage implements OnInit {
  threadMap: Map;
  addedSeismLayerControl: boolean;
  addedFloodLayerControl: boolean;
  addedLandSlideLayerControl: boolean;

  constructor(
    private menu: MenuController,
    private navCtrl: NavController,
    private authService: AuthService,
    private alertService: AlertService,
    private mappingService: MappingService
  ) {
    this.menu.enable(true);
    this.addedSeismLayerControl = false;
    this.addedFloodLayerControl = false;
    this.addedLandSlideLayerControl = false;
  }
  ionViewDidEnter() {
    this.mainScreenMap();
  }
  allowSeismLayerControl() {
    this.mappingService.seismThreadMaps.forEach(val => {
      if (!val.downloaded) {
        return false;
      }
    });
    return true;
  }
  allowFloodLayerControl() {
    this.mappingService.floodThreadMaps.forEach(val => {
      if (!val.downloaded) {
        return false;
      }
    });
    return true;
  }
  allowLandSlideLayerControl() {
    this.mappingService.landSlideThreadMaps.forEach(val => {
      if (!val.downloaded) {
        return false;
      }
    });
    return true;
  }
  addControlLayers() {
    if (this.allowSeismLayerControl() && !this.addedSeismLayerControl) {
      const seismOverlay = {};
      this.mappingService.seismThreadMaps.forEach(val => {
        seismOverlay[val.layerName] = val.gJSON;
      });
      control.layers(null, seismOverlay).addTo(this.threadMap);
      this.addedSeismLayerControl = true;
    }
    if (this.allowFloodLayerControl() && !this.addedFloodLayerControl) {
      const floodOverlay = {};
      this.mappingService.floodThreadMaps.forEach(val => {
        floodOverlay[val.layerName] = val.gJSON;
      });
      control.layers(null, floodOverlay).addTo(this.threadMap);
      this.addedFloodLayerControl = true;
    }
    if (this.allowLandSlideLayerControl() && !this.addedLandSlideLayerControl) {
      const landSlideOverlay = {};
      this.mappingService.landSlideThreadMaps.forEach(val => {
          landSlideOverlay[val.layerName] = val.gJSON;
      });
      control.layers(null, landSlideOverlay).addTo(this.threadMap);
      this.addedLandSlideLayerControl = true;
    }
  }
  mainScreenMap() {
    // Center Map on Venezuela
    this.threadMap = new Map('mapThreadId').setView([8.031, -65.346], 5);
    this.mappingService.mainCityMarker.addTo(this.threadMap);
    this.mappingService.threadBaseMap.addTo(this.threadMap);

    // Add all thread layers
    this.threadMap.flyTo(this.mappingService.mainCity, 12);
    this.addControlLayers();
  }
  ionViewWillLeave() {
    this.addedSeismLayerControl = false;
    this.addedFloodLayerControl = false;
    this.addedLandSlideLayerControl = false;
    this.threadMap.remove();
  }
  ngOnInit() {}
}
