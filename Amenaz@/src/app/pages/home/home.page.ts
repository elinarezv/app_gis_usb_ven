import { Component, OnInit } from '@angular/core';
import { MenuController, NavController } from '@ionic/angular';
import { Map, tileLayer, Layer, control, marker, icon, geoJSON } from 'leaflet';
import { AuthService } from 'src/app/services/auth.service';
import { AlertService } from 'src/app/services/alert.service';
import { MappingService } from 'src/app/services/mapping.service';

import { AlertController } from '@ionic/angular';

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
  actualCity: any;
  actualCityName: string;
  botomToolbarActive: boolean;

  constructor(
    private menu: MenuController,
    private navCtrl: NavController,
    private authService: AuthService,
    private alertService: AlertService,
    public alertController: AlertController,
    private mappingService: MappingService
  ) {
    this.menu.enable(true);
    this.addedLayerControl = false;
    this.arePlacesAvailable = false;
    this.isMarkerActive = false;
    this.actualCity = 0;
    this.actualCityName = 'Visión del Proyecto';
    this.botomToolbarActive = false;
  }
  nextCity(item) {
    if (this.actualCity == this.mappingService.cities.length - 1) {
      this.actualCity = 0;
    } else {
      this.actualCity += 1;
    }
    this.actualCityName = this.mappingService.cities[this.actualCity].name;
    this.centerOnCity();
  }
  previousCity(item) {
    if (this.actualCity == 0) {
      this.actualCity = this.mappingService.cities.length - 1;
    } else {
      this.actualCity -= 1;
    }
    this.actualCityName = this.mappingService.cities[this.actualCity].name;
    this.centerOnCity();
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
  async presentAlert() {
    const alert = await this.alertController.create({
      header: 'Visión del Proyecto',
      message: 'APP Movil SIG proporciona una visión general de los peligros para una ubicación determinada, que deberían tenerse \
      en cuenta en el diseño y la ejecución de un proyecto para promover la resiliencia frente a los desastres y al \
      clima. La herramienta indica la probabilidad de que los distintos peligros naturales afecten a áreas del proyecto \
      (muy baja, baja, media y elevada) y da orientación sobre cómo reducir los impactos de estos peligros y dónde \
      encontrar información. Los niveles de peligro indicados se basan en los datos de peligros publicados y \
      proporcionados por una serie de organizaciones privadas, académicas y públicas. \
      Los usuarios y los posibles asociados pueden realizar consultas a los administradores de la aplicación y \
      proveerles información adicional para la herramienta, usando el formulario de comentarios de AppMóvilSIG..',
      buttons: ['Aceptar']
    });

    await alert.present();
  }
  mainScreenMap() {
    // Center Map on Venezuela
    this.map = new Map('mapId').setView(this.mappingService.cities[0].location, this.mappingService.cities[0].zoomLevel);
    this.mappingService.cities.forEach(city => {
      if (city.name != 'Visión del Proyecto') {
        city.marker.addTo(this.map)
      }
    })

    // Add all non-thread layers
    this.mappingService.baseMap.addTo(this.map);
    // this.map.addControl(this.mappingService.searchControProvider);
    this.centerOnCity();
    this.presentAlert();
  }
  centerOnCity() {
    this.map.flyTo(this.mappingService.cities[this.actualCity].location, this.mappingService.cities[this.actualCity].zoomLevel);
    if (this.mappingService.cities[this.actualCity].name != 'Visión del Proyecto') {
      this.botomToolbarActive = true;
    } else {
      this.botomToolbarActive = false;
    }
    // if (this.actualCity == 0) {
    // this.map.flyTo(this.mappingService.mainCity, 12);
    // if (this.allowLayerControl() && !this.addedLayerControl) {
    //   const overlayMaps = {};
    //   this.mappingService.nonThreadMaps.forEach(val => {
    //     overlayMaps[val.layerName] = val.gJSON;
    //   });
    //   control.layers(null, overlayMaps).addTo(this.map);
    //   const nodeList = document.querySelectorAll<HTMLElement>(
    //     '.leaflet-top.leaflet-right .leaflet-control-layers.leaflet-control .leaflet-control-layers-toggle'
    //   );
    //   Array.from(nodeList).forEach(el => {
    //     el.style.backgroundImage = 'url("/assets/icon/political.png")';
    //     el.style.backgroundPosition = 'center';
    //     el.style.backgroundRepeat = 'no-repeat';
    //     el.style.backgroundSize = 'cover';
    //   });
    //   this.addedLayerControl = true;
    // }
    // } else if (this.actualCity == '<< Chacao >>') {
    // }
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
  ngOnInit() { }
}
