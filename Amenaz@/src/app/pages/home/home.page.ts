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
import { Capabilities } from 'protractor';

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
    this.mappingService.nonThreadMaps.forEach(val => {
      if (!val.downloaded) {
        return false;
      }
    });
    return true;
  }
  gotoPosition() {
    this.mappingService.checkGPSPermission();
    if (this.mappingService.gotGeoposition) {
      this.map.flyTo([this.mappingService.geoLatitude, this.mappingService.geoLongitude], 12);
    }
  }
  mainScreenMap() {
    // Center Map on Venezuela
    this.map = new Map('mapId').setView([8.031, -65.346], 5);
    this.mappingService.mainCityMarker.addTo(this.map);

    // Add all non-thread layers
    this.mappingService.baseMap.addTo(this.map);
  }
  centerOnCity() {
    this.map.flyTo(this.mappingService.mainCity, 12);
    if (this.allowLayerControl() && !this.addedLayerControl) {
      const overlayMaps = {};
      this.mappingService.nonThreadMaps.forEach(val => {
        overlayMaps[val.layerName] = val.gJSON;
      });
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
