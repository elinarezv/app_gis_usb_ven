import { Injectable } from '@angular/core';
import { NativeStorage } from '@ionic-native/native-storage/ngx';
import { EnvService } from './env.service';
import { Map, Control, tileLayer, Layer, marker, icon, polygon, geoJSON, LatLngExpression } from 'leaflet';
import { AuthService } from 'src/app/services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class MappingService {
  mainCity: LatLngExpression = [8.5875788, -71.1572352];
  mainCityMarker: any;
  map: Map;
  baseMap: any;
  threadBaseMap: any;

  // Non Thread Layers
  urbanArea: any;
  urbanPoly: any;
  albarregasPZ: any;
  meridaPolitical: any;

  // Seism Thread Layers
  bufferBT: any;
  bufferFault: any;
  mzsSediments: any;

  // LandSlides Thread Layers
  sMovMass: any;

  // Flood Thread Layers
  zpHydrograph: any;

  constructor(private authService: AuthService, private storage: NativeStorage, private env: EnvService) {
    // Add OSM Base Map
    this.baseMap = tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      id: 'mapId',
      attribution: 'www.usb.ve MIT License'
    });
    this.threadBaseMap = tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      id: 'mapThreadId',
      attribution: 'www.usb.ve MIT License'
    });
    // Fix Leaflet bug with markers
    const iconRetinaUrl = 'assets/marker-icon-2x.png';
    const iconUrl = 'assets/marker-icon.png';
    const shadowUrl = 'assets/marker-shadow.png';
    // Add Marker of City with GeoInformation
    this.mainCityMarker =  marker(this.mainCity, {
      icon: icon({
        iconRetinaUrl,
        iconUrl,
        shadowUrl,
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        tooltipAnchor: [16, -28],
        shadowSize: [41, 41]
      })
    })
      .bindPopup('Merida')
      .openPopup();
  }
}
