import { Injectable } from '@angular/core';
import { NativeStorage } from '@ionic-native/native-storage/ngx';
import { EnvService } from './env.service';
import { Map, tileLayer, marker, icon, geoJSON, LatLngExpression } from 'leaflet';
import { AuthService } from 'src/app/services/auth.service';

import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { from } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { LocationAccuracy } from '@ionic-native/location-accuracy/ngx';

type LayerType = {
  layerName: string;
  queryName: string;
  gJSON: geoJSON;
  color: string;
  downloaded: boolean;
};

@Injectable({
  providedIn: 'root'
})
export class MappingService {
  mainCity: LatLngExpression = [8.5875788, -71.1572352];
  mainCityMarker: any;
  map: Map;
  baseMap: Map;
  threadBaseMap: Map;
  nonThreadMaps: LayerType[] = [];
  seismThreadMaps: LayerType[] = [];
  landSlideThreadMaps: LayerType[] = [];
  floodThreadMaps: LayerType[] = [];

  geoLatitude: number;
  geoLongitude: number;
  geoAccuracy: number;
  geoAddress: string;
  gotGeoposition: boolean;

  constructor(
    private authService: AuthService,
    private storage: NativeStorage,
    private env: EnvService,
    private androidPermissions: AndroidPermissions,
    private geolocation: Geolocation,
    private locationAccuracy: LocationAccuracy,
    private http: HttpClient
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
    this.nonThreadMaps.push({
      layerName: 'Área urbana',
      queryName: 'a_urbana_geojson',
      gJSON: undefined,
      color: '#ff3300',
      downloaded: false
    });
    this.nonThreadMaps.push({
      layerName: 'Poligonal urbana',
      queryName: 'polg_urbana_geojson',
      gJSON: undefined,
      color: '#ccff33',
      downloaded: false
    });
    this.nonThreadMaps.push({
      layerName: 'Zona Prot. Río Albarregas',
      queryName: 'zpr_albarregas_geojson',
      gJSON: undefined,
      color: '#0000ff',
      downloaded: false
    });
    this.nonThreadMaps.push({
      layerName: 'Parroquias Libertador',
      queryName: 'pquias_libertador_geojson',
      gJSON: undefined,
      color: '#33cc33',
      downloaded: false
    });
    this.seismThreadMaps.push({
      layerName: 'Bordes de Terraza',
      queryName: 'bufer_bt_mda_geojson',
      gJSON: undefined,
      color: '#ff3300',
      downloaded: false
    });
    this.seismThreadMaps.push({
      layerName: 'Zona Influencia Fallas Geol',
      queryName: 'buffer_fallas_geol_geojson',
      gJSON: undefined,
      color: '#ccff33',
      downloaded: false
    });
    this.seismThreadMaps.push({
      layerName: 'Microzonas Sísmicas',
      queryName: 'mzs_sedimentos_geojson',
      gJSON: undefined,
      color: '#33cc33',
      downloaded: false
    });
    this.landSlideThreadMaps.push({
      layerName: 'Zonas Suceptibles',
      queryName: 's_mov_mass_geojson',
      gJSON: undefined,
      color: '#750028',
      downloaded: false
    });
    this.landSlideThreadMaps.push({
      layerName: 'Bordes de Terraza',
      queryName: 'bufer_bt_mda_geojson',
      gJSON: undefined,
      color: '#33cc33',
      downloaded: false
    });
    this.floodThreadMaps.push({
      layerName: 'Crecida de Afluentes',
      queryName: 'zp_hydrograf_geojson',
      gJSON: undefined,
      color: '#0000ff',
      downloaded: false
    });

    this.getAllMaps();
  }
  getGeoJSON(layerName: string) {
    const parameter = new HttpParams().set('layerName', layerName);
    return this.http
      .get(this.env.API_URL + 'data/getlayer', {
        headers: {
          Authorization: 'Basic ' + this.authService.token,
          'x-access-token': this.authService.token.token
        },
        params: parameter
      })
      .pipe(
        tap(data => {
          this.storage.setItem(layerName, data).catch(error => {
            console.log('Error storing Item');
          });
          return data;
        })
      );
  }
  getLayer(layerName: string) {
    return from(this.storage.getItem(layerName)).pipe(
        catchError(error => this.getGeoJSON(layerName))
    );
  }
  getNonThreadMaps() {
    this.nonThreadMaps.forEach(ntMap => {
      this.getLayer(ntMap.queryName).subscribe(
        result => {
          ntMap.gJSON = geoJSON(result, {
            style: {
              color: ntMap.color,
              weight: 2,
              opacity: 0.65
            }
          });
          ntMap.downloaded = true;
        },
        error => {
          console.log(error);
        }
      );
    });
  }
  getSeismMaps() {
    this.seismThreadMaps.forEach(sMap => {
      this.getLayer(sMap.queryName).subscribe(
        result => {
          sMap.gJSON = geoJSON(result, {
            style: {
              color: sMap.color,
              weight: 2,
              opacity: 0.65
            }
          });
          sMap.downloaded = true;
        },
        error => {
          console.log(error);
        }
      );
    });
  }
  getLandSlideMaps() {
    this.landSlideThreadMaps.forEach(landMap => {
      this.getLayer(landMap.queryName).subscribe(
        result => {
          landMap.gJSON = geoJSON(result, {
            style: {
              color: landMap.color,
              weight: 2,
              opacity: 0.65
            }
          });
          landMap.downloaded = true;
        },
        error => {
          console.log(error);
        }
      );
    });
  }
  getFloodThreadMaps() {
    this.floodThreadMaps.forEach(floodMap => {
      this.getLayer(floodMap.queryName).subscribe(
        result => {
          floodMap.gJSON = geoJSON(result, {
            style: {
              color: floodMap.color,
              weight: 2,
              opacity: 0.65
            }
          });
          floodMap.downloaded = true;
        },
        error => {
          console.log(error);
        }
      );
    });
  }
  getAllMaps() {
    this.getNonThreadMaps();
    this.getSeismMaps();
    this.getLandSlideMaps();
    this.getFloodThreadMaps();
  }
  checkGPSPermission() {
    this.androidPermissions.checkPermission(this.androidPermissions.PERMISSION.ACCESS_COARSE_LOCATION).then(
      result => {
        if (result.hasPermission) {
          this.askToTurnOnGPS();
        } else {
          this.requestGPSPermission();
        }
      },
      err => {
        alert(err);
      }
    );
  }
  requestGPSPermission() {
    this.locationAccuracy.canRequest().then((canRequest: boolean) => {
      if (canRequest) {
        console.log('4');
      } else {
        this.androidPermissions.requestPermission(this.androidPermissions.PERMISSION.ACCESS_COARSE_LOCATION).then(
          () => {
            this.askToTurnOnGPS();
          },
          error => {
            alert('requestPermission Error requesting location permissions ' + error);
          }
        );
      }
    });
  }

  askToTurnOnGPS() {
    this.locationAccuracy.request(this.locationAccuracy.REQUEST_PRIORITY_HIGH_ACCURACY).then(
      () => {
        this.getGeolocation();
      },
      error => alert('Error requesting location permissions ' + JSON.stringify(error))
    );
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
          // alert("error getting location")
          alert('Can not retrieve Location');
        }
      )
      .catch(error => {
        alert('Error getting location' + JSON.stringify(error));
      });
  }
}
