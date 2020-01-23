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
  async generalInfo() {
    let message: string;
    if (this.actualCityName == 'Chacao') {
      message = '<em>Municipio Chacao</em> <br/> \
      Estado	Miranda <br/> \
      N_Parro	1 <br/> \
      A_hect	873,66 <br/> \
      Perimetro	13,03 ';
    } else if (this.actualCityName == 'Cumaná') {
      message = '<em>Ciudad de Cumaná</em> <br/> \
      Area (km2)	64,41 <br/> \
      Perimetro (km)	47,53';
    } else if (this.actualCityName == 'Mérida') {
      message = '<em>Ciudad de Mérida</em> <br/> \
      Area (km2)	96,28 <br/> \
      Perimetro (km)	52,01';
    }
    const alert = await this.alertController.create({
      header: 'Ubicación',
      message: message,
      buttons: ['Aceptar']
    });

    await alert.present();

  }
  async location() {
    let message: string;
    if (this.actualCityName == 'Chacao') {
      message = 'El municipio Chacao es uno de los 21 municipios del estado Miranda y uno de los 5 municipios \
      del Distrito Metropolitano de Caracas, Venezuela. Cuenta con 13 km² de superficie, lo que lo convierte \
      en el municipio más pequeño de la ciudad y está conformado por una sola parroquia: San José de Chacao. \
      Limita con los municipios Libertador al oeste, municipio Baruta al sur, Sucre al este y con el cerro El \
      Ávila al norte. <br/> \
      Posee una población de más de 71 mil habitantes, lo que representa una densidad de 5.486,53 hab./km², según el Instituto Nacional \
      de Estadística (INE), ubicándo a Chacao en el cuarto lugar dentro de los municipios que conforman el área \
      metropolitana de Caracas, siendo uno de los más densamente poblados del Distrito Metropolitano de Caracas. \
      Entre las urbanizaciones se encuentran: Chacao, Altamira, La Castellana, La Floresta, Los Palos Grandes, \
      El Rosal, Campo Alegre, El Bosque, El Dorado, EL Retiro y San Marino, San Souci, Estado Leal y Bello Campo. \
      Entre los sectores más destacados se encuentran: El Casco Histórico de Chacao y El Caracas Country Club. \
      Chacao es junto con el municipio Baruta y Los Salias uno de los municipios más ricos de Venezuela, con \
      un índice de pobreza de apenas el 4,67% según el censo del año 2011. Gracias a su economía, alberga los \
      principales centros financieros y centros comerciales de la ciudad, tales como el Centro Ciudad Comercial \
      Tamanaco (CCCT), el Centro Sambil, el Centro Lido y el Centro San Ignacio. <br/> \
      Es sede además de las principales sedes bancarias de instituciones locales y extranjeras, casas de bolsas, \
      los hoteles más lujosos de la ciudad y las mansiones de personalidades reconocidas en el ámbito político y \
      económico del país. ';
    } else if (this.actualCityName == 'Cumaná') {
      message = 'Info de Cumaná';
    } else if (this.actualCityName == 'Mérida') {
      message = 'Info de Mérida';
    }
    const alert = await this.alertController.create({
      header: 'Información General',
      message: message,
      buttons: ['Aceptar']
    });

    await alert.present();

  }
}
