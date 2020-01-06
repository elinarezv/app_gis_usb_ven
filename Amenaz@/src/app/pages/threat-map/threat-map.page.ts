import { Component, OnInit } from '@angular/core';
import { MenuController, NavController } from '@ionic/angular';
import { Map, control } from 'leaflet';
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
  addedLayerControl: boolean;
  addedSeismLayerControl: boolean;
  addedFloodLayerControl: boolean;
  addedLandSlideLayerControl: boolean;
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
    this.addedSeismLayerControl = false;
    this.addedFloodLayerControl = false;
    this.addedLandSlideLayerControl = false;
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
    if (this.allowLayerControl() && !this.addedLayerControl) {
      const overlayMaps = {};
      this.mappingService.nonThreadMaps.forEach(val => {
        overlayMaps[val.layerName] = val.gJSON;
      });
      control.layers(null, overlayMaps).addTo(this.threadMap);
      const nodeList = document.querySelectorAll<HTMLElement>(
        '.leaflet-top.leaflet-right .leaflet-control-layers.leaflet-control:nth-child(1) .leaflet-control-layers-toggle'
      );
      Array.from(nodeList).forEach(el => {
        el.style.backgroundImage = 'url("/assets/icon/political.png")';
        el.style.backgroundPosition = 'center';
        el.style.backgroundRepeat = 'no-repeat';
        el.style.backgroundSize = 'cover';
      });
      this.addedLayerControl = true;
    }
    if (this.allowSeismLayerControl() && !this.addedSeismLayerControl) {
      const seismOverlay = {};
      this.mappingService.seismThreadMaps.forEach(val => {
        seismOverlay[val.layerName] = val.gJSON;
      });
      control.layers(null, seismOverlay).addTo(this.threadMap);
      const nodeList = document.querySelectorAll<HTMLElement>(
        '.leaflet-top.leaflet-right .leaflet-control-layers.leaflet-control:nth-child(2) .leaflet-control-layers-toggle'
      );
      Array.from(nodeList).forEach(el => {
        el.style.backgroundImage = 'url("/assets/icon/seismic-on.svg")';
        el.style.backgroundPosition = 'center';
        el.style.backgroundRepeat = 'no-repeat';
        el.style.backgroundSize = 'cover';
      });
      this.addedSeismLayerControl = true;
    }
    if (this.allowFloodLayerControl() && !this.addedFloodLayerControl) {
      const floodOverlay = {};
      this.mappingService.floodThreadMaps.forEach(val => {
        floodOverlay[val.layerName] = val.gJSON;
      });
      control.layers(null, floodOverlay).addTo(this.threadMap);
      const nodeList = document.querySelectorAll<HTMLElement>(
        '.leaflet-top.leaflet-right .leaflet-control-layers.leaflet-control:nth-child(3) .leaflet-control-layers-toggle'
      );
      Array.from(nodeList).forEach(el => {
        el.style.backgroundImage = 'url("/assets/icon/flood-on.svg")';
        el.style.backgroundPosition = 'center';
        el.style.backgroundRepeat = 'no-repeat';
        el.style.backgroundSize = 'cover';
      });
      this.addedFloodLayerControl = true;
    }
    if (this.allowLandSlideLayerControl() && !this.addedLandSlideLayerControl) {
      const landSlideOverlay = {};
      this.mappingService.landSlideThreadMaps.forEach(val => {
        landSlideOverlay[val.layerName] = val.gJSON;
      });
      control.layers(null, landSlideOverlay).addTo(this.threadMap);
      const nodeList = document.querySelectorAll<HTMLElement>(
        '.leaflet-top.leaflet-right .leaflet-control-layers.leaflet-control:nth-child(4) .leaflet-control-layers-toggle'
      );
      Array.from(nodeList).forEach(el => {
        el.style.backgroundImage = 'url("/assets/icon/landslide-on.svg")';
        el.style.backgroundPosition = 'center';
        el.style.backgroundRepeat = 'no-repeat';
        el.style.backgroundSize = 'cover';
      });
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
      this.threadMap.removeLayer(this.mappingService.searchMarker);
    }
    this.mappingService.setSearchMarker(Number(place.y), Number(place.x));
    if (this.mappingService.isSearchMarkerSet) {
      console.log('Adding to map');
      this.mappingService.searchMarker
        .addTo(this.threadMap)
        .bindPopup(place.label)
        .openPopup();
      this.threadMap.flyTo([Number(place.y), Number(place.x)], 11);
      this.isMarkerActive = true;
    }
    this.mappingService.searchPlaces = [];
    this.arePlacesAvailable = false;
  }
  ionViewWillLeave() {
    this.addedSeismLayerControl = false;
    this.addedFloodLayerControl = false;
    this.addedLandSlideLayerControl = false;
    this.threadMap.remove();
  }
  ngOnInit() {}
}
