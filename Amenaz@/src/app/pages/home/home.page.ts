import { Component, OnInit } from '@angular/core';
import { MenuController, Events, Platform } from '@ionic/angular';
import { MappingService } from 'src/app/services/mapping.service';

import { AlertController } from '@ionic/angular';

import { Map, control } from 'leaflet';
import * as L from 'leaflet';
import 'leaflet.locatecontrol';
import 'leaflet.pattern';


@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss']
})
export class HomePage implements OnInit {
  addedLayerControl: boolean;
  arePlacesAvailable: boolean;
  isMarkerActive: boolean;
  actualCity: any;
  actualCityName: string;
  actualCityThreats: string[];
  botomToolbarActive: boolean;
  searchBarActive: boolean;
  threatToolbarActive: boolean;
  actualThreatName: string;
  layerControl: L.Control;
  overlayMaps = {};
  baseLayerMap: any;
  areMarkersActive: boolean;
  backButtonSubscription;

  constructor(
    private menu: MenuController,
    public alertController: AlertController,
    private mappingService: MappingService,
    public events: Events,
    private platform: Platform
  ) {
    this.menu.enable(true);
    this.addedLayerControl = false;
    this.arePlacesAvailable = false;
    this.isMarkerActive = false;
    this.actualCity = 0;
    this.actualCityName = 'Visión del Proyecto';
    this.botomToolbarActive = false;
    this.searchBarActive = false;
    this.threatToolbarActive = false;
    this.actualThreatName = '';
    this.actualCityThreats = [];
    this.layerControl = null;
    this.areMarkersActive = false;
  }
  ionViewDidLoad() {
  }
  removeLayerControl() {
    Object.keys(this.overlayMaps).forEach(key => {
      this.mappingService.map.removeLayer(this.overlayMaps[key]);
    });
    this.mappingService.cities.find(x => x.name === this.actualCityName).layers.forEach(layer => {
      if (layer.fixed && this.botomToolbarActive) {
        this.mappingService.map.removeLayer(layer.gJSON);
      }
    });
    this.overlayMaps = {};
    if (this.layerControl != null && this.layerControl != undefined) {
      this.layerControl.remove();
      this.mappingService.map.removeControl(this.layerControl);
      this.layerControl = undefined;
    }
  }
  nextCity(item) {
    if (this.actualCity == this.mappingService.cities.length - 1) {
      this.actualCity = 0;
    } else {
      this.actualCity += 1;
    }
    this.actualCityName = this.mappingService.cities[this.actualCity].name;
    if (this.layerControl != null && this.layerControl != undefined) {
      this.layerControl.remove();
      this.layerControl = null;
    }
    if (this.baseLayerMap != undefined && this.baseLayerMap != null) {
      this.mappingService.map.removeLayer(this.baseLayerMap.gJSON);
    }
    this.removeLayerControl();
    this.botomToolbarActive = false;
    this.searchBarActive = false;
    this.threatToolbarActive = false;
    this.actualThreatName = '';
    this.actualCityThreats = [];
    this.centerOnCity();
  }
  previousCity(item) {
    if (this.actualCity == 0) {
      this.actualCity = this.mappingService.cities.length - 1;
    } else {
      this.actualCity -= 1;
    }
    this.actualCityName = this.mappingService.cities[this.actualCity].name;
    if (this.layerControl != null && this.layerControl != undefined) {
      this.layerControl.remove();
      this.layerControl = null;
    }
    if (this.baseLayerMap != undefined && this.baseLayerMap != null) {
      this.mappingService.map.removeLayer(this.baseLayerMap.gJSON);
    }
    this.removeLayerControl();
    this.botomToolbarActive = false;
    this.searchBarActive = false;
    this.threatToolbarActive = false;
    this.actualThreatName = '';
    this.actualCityThreats = [];
    this.centerOnCity();
  }
  ionViewDidEnter() {
    this.mainScreenMap();
    this.events.subscribe('cities-loaded',
      () => {
        console.log('Cities Loaded Event called');
        this.putCityMarkers();
      });
  }
  ionViewWillEnter() {
    this.backButtonSubscription = this.platform.backButton.subscribe(async () => {
      navigator['app'].exitApp();
    });
  }
  ionViewDidLeave() {
    this.backButtonSubscription.unsubscribe();
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
      this.mappingService.map.flyTo([this.mappingService.geoLatitude, this.mappingService.geoLongitude], 12);
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
  putCityMarkers() {
    this.mappingService.cities.forEach(city => {
      if (city.name != 'Visión del Proyecto') {
        city.marker.addTo(this.mappingService.map)
      }
    })
    this.areMarkersActive = true;
  }
  removeCitiMarkers() {
    if (this.areMarkersActive) {
      this.mappingService.cities.forEach(city => {
        if (city.name != 'Visión del Proyecto') {
          city.marker.removeFrom(this.mappingService.map);
        }
      });
      this.areMarkersActive = false;
    }
  }
  mainScreenMap() {
    // Center Map on Venezuela
    this.mappingService.map = new Map('mapId').setView(this.mappingService.cities[0].location, this.mappingService.cities[0].zoomLevel);
    // Add all non-thread layers
    this.mappingService.baseMap.addTo(this.mappingService.map);
    L.control.locate({ setView: 'untilPanOrZoom', flyTo: true }).addTo(this.mappingService.map);
    const nodeList = document.querySelectorAll<HTMLElement>(
      '.leaflet-control-locate.leaflet-bar.leaflet-control .leaflet-bar-part.leaflet-bar-part-single span'
    );
    Array.from(nodeList).forEach(el => {
      el.classList.remove('fa-map-marker');
      el.classList.add('fa-crosshairs');
    });
    this.centerOnCity();
    this.presentAlert();
  }
  loadThreatLayers(layerType: string) {
    this.mappingService.cities.find(x => x.name === this.actualCityName).layers.forEach(layer => {
      if (layer.fixed && layerType !== 'Ninguna') {
        layer.gJSON.setStyle({ color: '#000000', fill: false });
        layer.gJSON.addTo(this.mappingService.map);
      }
      if (layer.fixed && layerType === 'Ninguna') {
        layer.gJSON.setStyle({ color: layer.color, fill: false });
      }
      layer.threadType.forEach(threat => {
        if (this.actualCityThreats.find(x => x === threat) == undefined && threat !== 'Ninguna' && threat !== '') {
          this.actualCityThreats.push(threat);
        }
        if (threat === layerType) {
          this.overlayMaps[layer.layerName] = layer.gJSON;
          layer.gJSON.addTo(this.mappingService.map);
        }
      });
    });
    // Load layers with 'Ninguna' on ThreatType
    if (this.overlayMaps) {
      this.layerControl = control.layers(null, this.overlayMaps);
      this.layerControl.addTo(this.mappingService.map);
      this.actualThreatName = layerType;
    }
  }
  centerOnCity() {
    // this.mappingService.map.flyTo(this.mappingService.cities[this.actualCity].location, this.mappingService.cities[this.actualCity].zoomLevel);
    this.mappingService.map.setView(this.mappingService.cities[this.actualCity].location, this.mappingService.cities[this.actualCity].zoomLevel);
    if (this.mappingService.cities[this.actualCity].name !== 'Visión del Proyecto') {
      // Load Project's Area Layer
      this.mappingService.cities.find(x => x.name === this.actualCityName).layers.forEach(layer => {
        layer.threadType.forEach(threat => {
          if (threat === '') {
            this.baseLayerMap = layer;
            this.baseLayerMap.gJSON.addTo(this.mappingService.map);
          }
        });
      });
      this.removeCitiMarkers();
      this.loadThreatLayers('Ninguna');
      this.botomToolbarActive = true;
    } else {
      this.putCityMarkers();
      this.botomToolbarActive = false;
      this.searchBarActive = false;
      this.threatToolbarActive = false;
      this.actualThreatName = '';
      this.actualCityThreats = [];
    }
  }
  toggleSearchBar() {
    this.searchBarActive = !this.searchBarActive;
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
      this.mappingService.map.removeLayer(this.mappingService.searchMarker);
    }
    this.mappingService.setSearchMarker(Number(place.y), Number(place.x));
    if (this.mappingService.isSearchMarkerSet) {
      console.log('Adding to map');
      this.mappingService.searchMarker
        .addTo(this.mappingService.map)
        .bindPopup(place.label)
        .openPopup();
      this.mappingService.map.flyTo([Number(place.y), Number(place.x)], 11);
      this.isMarkerActive = true;
    }
    this.mappingService.searchPlaces = [];
    this.arePlacesAvailable = false;
  }
  ionViewWillLeave() {
    this.addedLayerControl = false;
    this.mappingService.map.remove();
  }
  ngOnInit() {

  }
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
      header: 'Información General',
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
      header: 'Ubicación',
      message: message,
      buttons: ['Aceptar']
    });
    await alert.present();
  }
  threats() {
    this.removeLayerControl();
    this.threatToolbarActive = !this.threatToolbarActive;
    if (!this.threatToolbarActive) {
      this.loadThreatLayers('Ninguna');
    } else {
      // Load first threat layers name
      if (this.actualCityThreats.length != 0) {
        this.actualThreatName = this.actualCityThreats[0];
        this.loadThreatLayers(this.actualThreatName);
      } else {
        this.actualThreatName = 'No hay datos';
      }
    }
  }
  nextThreat(item) {
    let index = this.actualCityThreats.indexOf(this.actualThreatName);
    if (index == this.actualCityThreats.length - 1) {
      this.actualThreatName = this.actualCityThreats[0];
    } else {
      index += 1;
      this.actualThreatName = this.actualCityThreats[index];
    }
    this.removeLayerControl();
    if (this.actualCityThreats.length != 0) {
      this.loadThreatLayers(this.actualThreatName);
    } else {
      this.actualThreatName = 'No hay datos';
    }
  }
  previousThreat(item) {
    let index = this.actualCityThreats.indexOf(this.actualThreatName);
    if (index == 0) {
      this.actualThreatName = this.actualCityThreats[this.actualCityThreats.length - 1];
    } else {
      index -= 1;
      this.actualThreatName = this.actualCityThreats[index];
    }
    this.removeLayerControl();
    if (this.actualCityThreats.length != 0) {
      this.loadThreatLayers(this.actualThreatName);
    } else {
      this.actualThreatName = 'No hay datos';
    }
  }
}
