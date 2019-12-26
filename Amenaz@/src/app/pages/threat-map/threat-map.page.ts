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
    if (this.mappingService.bufferBT && this.mappingService.bufferFault && this.mappingService.mzsSediments) {
      return true;
    }
    return false;
  }
  allowFloodLayerControl() {
    if (this.mappingService.zpHydrograph) {
      return true;
    }
    return false;
  }
  allowLandSlideLayerControl() {
    if (this.mappingService.bufferBT && this.mappingService.sMovMass) {
      return true;
    }
    return false;
  }
  addLayertoMap(layerName: string, color: string) {
    this.authService.getLayer(layerName).subscribe(
      result => {
        const var1 = geoJSON(result, {
          style: {
            color: color,
            weight: 2,
            opacity: 0.65
          }
        });
        switch (layerName) {
          case 'bufer_bt_mda_geojson':
            this.mappingService.bufferBT = var1;
            break;
          case 'buffer_fallas_geol_geojson':
            this.mappingService.bufferFault = var1;
            break;
          case 'mzs_sedimentos_geojson':
            this.mappingService.mzsSediments = var1;
            break;
          case 'zp_hydrograf_geojson':
            this.mappingService.zpHydrograph = var1;
            break;
          case 's_mov_mass_geojson':
            this.mappingService.sMovMass = var1;
            break;
        }
        this.addControlLayers();
      },
      error => {
        console.log(error);
      },
      () => {
        console.log('Add to map');
      }
    );
  }
  addControlLayers() {
    if (this.allowSeismLayerControl() && !this.addedSeismLayerControl) {
      const seismOverlay = {
        'Bordes de Terraza': this.mappingService.bufferBT,
        'Zona Influencia Fallas Geol': this.mappingService.bufferFault,
        'Microzonas Sísmicas': this.mappingService.mzsSediments
      };
      control.layers(null, seismOverlay).addTo(this.threadMap);
      this.addedSeismLayerControl = true;
    }
    if (this.allowFloodLayerControl() && !this.addedFloodLayerControl) {
      const floodOverlay = {
        'Crecida de Afluentes': this.mappingService.zpHydrograph
      };
      control.layers(null, floodOverlay).addTo(this.threadMap);
      this.addedFloodLayerControl = true;
    }
    if (this.allowLandSlideLayerControl() && !this.addedLandSlideLayerControl) {
      const landSlideOverlay = {
        'Bordes de Terraza': this.mappingService.bufferBT,
        'Zonas Suceptibles': this.mappingService.sMovMass
      };
      control.layers(null, landSlideOverlay).addTo(this.threadMap);
      this.addedLandSlideLayerControl = true;
    }
  }
  addLayers2ThreadMap() {
    // Seismic Thread
    if (!this.mappingService.bufferBT) {
      this.addLayertoMap('bufer_bt_mda_geojson', '#ff3300');
    }
    if (!this.mappingService.bufferFault) {
      this.addLayertoMap('buffer_fallas_geol_geojson', '#ccff33');
    }
    if (!this.mappingService.mzsSediments) {
      this.addLayertoMap('mzs_sedimentos_geojson', '#33cc33');
    }
    // Flood Thread
    if (!this.mappingService.zpHydrograph) {
      this.addLayertoMap('zp_hydrograf_geojson', '#0000ff');
    }
    // LandSlide Thread
    if (!this.mappingService.sMovMass) {
      this.addLayertoMap('s_mov_mass_geojson', '#750028');
    }
  }
  mainScreenMap() {
    // Center Map on Venezuela
    this.threadMap = new Map('mapThreadId').setView([8.031, -65.346], 5);
    this.mappingService.mainCityMarker.addTo(this.threadMap);
    this.mappingService.threadBaseMap.addTo(this.threadMap);

    // Add all thread layers
    this.threadMap.flyTo(this.mappingService.mainCity, 12);
    this.addLayers2ThreadMap();
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
