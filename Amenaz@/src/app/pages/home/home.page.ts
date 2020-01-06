import { Component, OnInit } from '@angular/core';
import { MenuController, NavController } from '@ionic/angular';
import { Map, tileLayer, Layer, control, marker, icon, geoJSON } from 'leaflet';
import { AuthService } from 'src/app/services/auth.service';
import { AlertService } from 'src/app/services/alert.service';
import { MappingService } from 'src/app/services/mapping.service';

// import { Platform } from '@ionic/angular';
// import { Router } from '@angular/router';
// import { map } from 'rxjs/operators';
// import { observable } from 'rxjs';
// import { NgForm } from '@angular/forms';
// import { Capabilities } from 'protractor';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss']
})
export class HomePage implements OnInit {
  map: Map;
  addedLayerControl: boolean;
  arePlacesAvailable: boolean;
  isMarkerActive: boolean;

  constructor(
    private menu: MenuController,
    private navCtrl: NavController,
    private authService: AuthService,
    private alertService: AlertService,
    private mappingService: MappingService
  ) {
    this.menu.enable(true);
    this.addedLayerControl = false;
    this.arePlacesAvailable = false;
    this.isMarkerActive = false;
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
    // this.map.addControl(this.mappingService.searchControProvider);
  }
  centerOnCity() {
    this.map.flyTo(this.mappingService.mainCity, 12);
    if (this.allowLayerControl() && !this.addedLayerControl) {
      const overlayMaps = {};
      this.mappingService.nonThreadMaps.forEach(val => {
        overlayMaps[val.layerName] = val.gJSON;
      });
      control.layers(null, overlayMaps).addTo(this.map);
      const nodeList = document.querySelectorAll<HTMLElement>(
        '.leaflet-top.leaflet-right .leaflet-control-layers.leaflet-control .leaflet-control-layers-toggle'
      );
      Array.from(nodeList).forEach(el => {
        el.style.backgroundImage = 'url("/assets/icon/political.png")';
        el.style.backgroundPosition = 'center';
        el.style.backgroundRepeat = 'no-repeat';
        el.style.backgroundSize = 'cover';
      });
      this.addedLayerControl = true;
    }
  }
  ThreadEnv() {
    this.navCtrl.navigateForward('/threat-env');
  }
  ThreadMap() {
    this.navCtrl.navigateForward('/threat-map');
  }
  getPlaces(ev: any) {
    const input = ev.target.value;
    if (input && input.trim() !== '') {
      this.mappingService.searchPlaces = [];
      this.arePlacesAvailable = true;
      this.mappingService.searchProvider.search({ query: input }).then(results => {
        results.forEach(result => {
          this.mappingService.searchPlaces.push(result);
        });
      });
    } else {
      this.mappingService.searchPlaces = [];
    }
  }
  clickPlace(place) {
    console.log(place);
    if (this.mappingService.isSearchMarkerSet && this.isMarkerActive) {
      this.map.removeLayer(this.mappingService.searchMarker);
    }
    this.mappingService.setSearchMarker(Number(place.y), Number(place.x));
    if (this.mappingService.isSearchMarkerSet) {
      console.log('Adding to map');
      this.mappingService.searchMarker
        .addTo(this.map)
        .bindPopup(place.label)
        .openPopup();
      this.map.flyTo([Number(place.y), Number(place.x)], 11);
      this.isMarkerActive = true;
    }
    this.mappingService.searchPlaces = [];
    this.arePlacesAvailable = false;
  }
  ionViewWillLeave() {
    this.addedLayerControl = false;
    this.map.remove();
  }
  ngOnInit() {}
}
