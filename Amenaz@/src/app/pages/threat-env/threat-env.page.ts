import { Component, OnInit } from '@angular/core';
import { MenuController, NavController } from '@ionic/angular';
import { Map } from 'leaflet';
import { AuthService } from 'src/app/services/auth.service';
import { AlertService } from 'src/app/services/alert.service';
import { MappingService } from 'src/app/services/mapping.service';

import { OpenStreetMapProvider } from 'leaflet-geosearch';

@Component({
  selector: 'app-threat-env',
  templateUrl: './threat-env.page.html',
  styleUrls: ['./threat-env.page.scss']
})
export class ThreatEnvPage implements OnInit {
  threadEnvMap: Map;
  arePlacesAvailable: boolean;
  isMarkerActive: boolean;

  constructor(
    private menu: MenuController,
    private navCtrl: NavController,
    private authService: AuthService,
    private alertService: AlertService,
    private mappingService: MappingService
  ) {
    this.arePlacesAvailable = false;
    this.isMarkerActive = false;
  }

  mainScreenMap() {
    // Center Map on Venezuela
    this.threadEnvMap = new Map('mapIdEnvThreads').setView([8.031, -65.346], 5);
    this.mappingService.mainCityMarker.addTo(this.threadEnvMap);
    this.mappingService.threadBaseMap.addTo(this.threadEnvMap);
    this.threadEnvMap.locate({setView: true, watch: true});
    // Add all thread layers
    // this.threadEnvMap.flyTo(this.mappingService.mainCity, 12);
  }
  ionViewDidEnter() {
    this.mainScreenMap();
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
    if (this.mappingService.isSearchMarkerSet && this.isMarkerActive) {
      this.threadEnvMap.removeLayer(this.mappingService.searchMarker);
    }
    this.mappingService.setSearchMarker(Number(place.y), Number(place.x));
    if (this.mappingService.isSearchMarkerSet) {
      this.mappingService.searchMarker
        .addTo(this.threadEnvMap)
        .bindPopup(place.label)
        .openPopup();
      this.threadEnvMap.flyTo([Number(place.y), Number(place.x)], 11);
      this.isMarkerActive = true;
    }
    this.mappingService.searchPlaces = [];
    this.arePlacesAvailable = false;
  }
  ionViewWillLeave() {
    this.threadEnvMap.remove();
  }
  ngOnInit() {}
}
