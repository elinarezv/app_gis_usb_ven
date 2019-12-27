import { Injectable } from '@angular/core';
import { NativeStorage } from '@ionic-native/native-storage/ngx';
import { EnvService } from './env.service';
import { Map, tileLayer, marker, icon, geoJSON, LatLngExpression } from 'leaflet';
import { AuthService } from 'src/app/services/auth.service';

import { Geolocation } from '@ionic-native/geolocation/ngx';

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

  geoLatitude: number;
  geoLongitude: number;
  geoAccuracy: number;
  geoAddress: string;
  gotGeoposition: boolean;

  constructor(
    private authService: AuthService,
    private storage: NativeStorage,
    private env: EnvService,
    private geolocation: Geolocation
  ) {
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
    this.mainCityMarker = marker(this.mainCity, {
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
    this.gotGeoposition = false;
  }
  getGeolocation() {
    this.geolocation
      .getCurrentPosition({ maximumAge: 1000, timeout: 5000, enableHighAccuracy: true })
      .then(
        resp => {
          console.log(resp);
          this.geoLatitude = resp.coords.latitude;
          this.geoLongitude = resp.coords.longitude;
          this.geoAccuracy = resp.coords.accuracy;
          this.gotGeoposition = true;
        },
        err => {
          //alert("error getting location")
          alert('Can not retrieve Location');
        }
      )
      .catch(error => {
        alert('Error getting location' + JSON.stringify(error));
      });
  }
}
