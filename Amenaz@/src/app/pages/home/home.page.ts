import { Component, OnInit, ViewChild } from '@angular/core';
import {
  MenuController,
  Events,
  Platform,
  ModalController,
  AlertController,
  NavController,
  NavParams,
  IonSelect,
} from '@ionic/angular';

import { MappingService } from 'src/app/services/mapping.service';
import { InfoPageComponent } from 'src/app/components/info-page/info-page.component';

import * as L from 'leaflet';
import * as esri from 'esri-leaflet';
import * as Geocoding from 'esri-leaflet-geocoder';
import 'leaflet-easybutton';
import 'leaflet.locatecontrol';
import 'leaflet.pattern';
import '../../../assets/js/leaflet-polygon.fillPattern';
import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch';
import { NavigationExtras } from '@angular/router';
import { from } from 'rxjs';

type ThreatsButton = {
  title: string;
  iconName: string;
  pushed: boolean;
};

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
  @ViewChild('cityselector', { read: false, static: false }) citySelectorRef: IonSelect;

  addedLayerControl: boolean;
  areCitiesAvailable: boolean;
  isMarkerActive: boolean;
  actualCity: any;
  actualCityName: string;
  actualCityThreats: string[];
  threatsOnBar: ThreatsButton[] = [];
  botomToolbarActive: boolean;
  searchBarActive: boolean;
  threatToolbarActive: boolean;
  actualThreatName: string;
  layerControl: L.Control;
  overlayMaps = {};
  baseLayerMap: any;
  areMarkersActive: boolean;
  backButtonSubscription;
  selectedItem: string;
  private searchControl;
  private resultsLayersGroup;

  constructor(
    private menu: MenuController,
    public alertController: AlertController,
    public mappingService: MappingService,
    public events: Events,
    private platform: Platform,
    private modalController: ModalController,
    private navController: NavController
  ) {
    this.menu.enable(true);
    this.addedLayerControl = false;
    this.areCitiesAvailable = false;
    this.isMarkerActive = false;
    this.actualCity = 0;
    this.actualCityName = 'País';
    this.botomToolbarActive = false;
    this.searchBarActive = false;
    this.threatToolbarActive = false;
    this.actualThreatName = '';
    this.actualCityThreats = [];
    this.layerControl = null;
    this.areMarkersActive = false;
    this.events.subscribe('cities-loaded', () => {
      this.areCitiesAvailable = true;
      this.putCityMarkers();
      this.mappingService.downloadLocationsLayers(3);
      this.mappingService.downloadLocationsLayers(2);
      this.mappingService.downloadLocationsLayers(1);
    });
  }
  changeCity(event) {
    if (event.target.value !== 0 && event.target.value !== '0' && event.target.value !== '') {
      this.gotoCity(event.target.value);
    }
  }
  changeCityBlur(event) {
    // if (event.target.value ===)
    console.log(event);
  }
  gotoCity(cityID: number) {
    this.actualCity = this.mappingService.cities.indexOf(this.mappingService.cities.find((i) => i.id === cityID));
    const navigationExtras: NavigationExtras = { state: { actualCity: cityID } };
    this.navController.navigateForward('/city', navigationExtras);
  }
  jumToCity() {
    this.actualCityName = this.mappingService.cities[this.actualCity].name;
    if (this.layerControl !== null && this.layerControl !== undefined) {
      this.layerControl.remove();
      this.layerControl = null;
    }
    if (this.baseLayerMap !== undefined && this.baseLayerMap !== null) {
      this.mappingService.map.removeLayer(this.baseLayerMap.gJSON);
    }
    this.removeLayerControl();
    this.botomToolbarActive = false;
    this.searchBarActive = false;
    this.threatToolbarActive = false;
    this.actualThreatName = '';
    this.actualCityThreats = [];
    this.threatsOnBar = [];
    this.centerOnCity();
  }
  removeLayerControl() {
    Object.keys(this.overlayMaps).forEach((key) => {
      this.mappingService.map.removeLayer(this.overlayMaps[key]);
    });
    this.mappingService.cities
      .find((x) => x.name === this.actualCityName)
      .layers.forEach((layer) => {
        if (layer.fixed && this.botomToolbarActive) {
          this.mappingService.map.removeLayer(layer.gJSON);
        }
      });
    this.overlayMaps = {};
    if (this.layerControl !== null && this.layerControl !== undefined) {
      this.layerControl.remove();
      this.mappingService.map.removeControl(this.layerControl);
      this.layerControl = undefined;
    }
  }
  ionViewWillEnter() {
    this.backButtonSubscription = this.platform.backButton.subscribe(async () => {
      navigator['app'].exitApp();
    });
  }
  ionViewDidEnter() {
    this.selectedItem = '0';
    this.mainScreenMap();
    if (this.citySelectorRef) {
      this.citySelectorRef.value = '';
    }
  }
  ionViewWillLeave() {
    this.addedLayerControl = false;
    this.mappingService.map.remove();
  }
  ionViewDidLeave() {
    this.backButtonSubscription.unsubscribe();
  }
  allowLayerControl() {
    this.mappingService.nonThreadMaps.forEach((val) => {
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
      header: 'País',
      message:
        'APP Movil SIG proporciona una visión general de los peligros para una ubicación determinada, que deberían tenerse \
      en cuenta en el diseño y la ejecución de un proyecto para promover la resiliencia frente a los desastres y al \
      clima. La herramienta indica la probabilidad de que los distintos peligros naturales afecten a áreas del proyecto \
      (muy baja, baja, media y elevada) y da orientación sobre cómo reducir los impactos de estos peligros y dónde \
      encontrar información. Los niveles de peligro indicados se basan en los datos de peligros publicados y \
      proporcionados por una serie de organizaciones privadas, académicas y públicas. \
      Los usuarios y los posibles asociados pueden realizar consultas a los administradores de la aplicación y \
      proveerles información adicional para la herramienta, usando el formulario de comentarios de AppMóvilSIG..',
      buttons: ['Aceptar'],
    });

    await alert.present();
  }
  putCityMarkers() {
    this.mappingService.cities.forEach((city) => {
      city.marker.addTo(this.mappingService.map);
    });
    this.areMarkersActive = true;
  }
  removeCitiMarkers() {
    if (this.areMarkersActive) {
      this.mappingService.cities.forEach((city) => {
        city.marker.removeFrom(this.mappingService.map);
      });
      this.areMarkersActive = false;
    }
  }
  mainScreenMap() {
    // Center Map on Venezuela
    this.mappingService.map = new L.Map('mapId', { zoomControl: false }).setView(
      this.mappingService.initialView.location,
      this.mappingService.initialView.zoomLevel
    );
    // Add all non-thread layers
    // this.mappingService.baseMap.addTo(this.mappingService.map);
    // Check selected baseMap and apply
    this.mappingService.baseMap.addTo(this.mappingService.map);
    if (this.mappingService.baseMapLabels) {
      this.mappingService.baseMapLabels.addTo(this.mappingService.map);
    }

    const arcgisOnline = Geocoding.arcgisOnlineProvider({ countries: ['VEN'] });

    this.searchControl = Geocoding.geosearch({
      position: 'topleft',
      collapseAfterResult: true,
      expanded: false,
      placeholder: 'Escriba un lugar a buscar...',
      allowMultipleResults: true,
      providers: [arcgisOnline],
      useMapBounds: true,
    });

    // Commented by elinarezv to 4 testing purposes...
    // Home button
    L.easyButton('fa-home fa-lg', () => {
      this.mappingService.map.setView(this.mappingService.initialView.location, this.mappingService.initialView.zoomLevel);
    }).addTo(this.mappingService.map);

    this.searchControl.addTo(this.mappingService.map);

    // create an empty layer group to store the results and add it to the map
    this.resultsLayersGroup = L.layerGroup().addTo(this.mappingService.map);

    const iconVar = L.icon({
      iconRetinaUrl: this.mappingService.iconRetinaUrl,
      iconUrl: this.mappingService.iconUrl,
      shadowUrl: this.mappingService.shadowUrl,
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      tooltipAnchor: [16, -28],
      shadowSize: [41, 41],
    });

    this.searchControl.on('results', (data) => {
      this.resultsLayersGroup.clearLayers();
      for (let i = data.results.length - 1; i >= 0; i--) {
        const resultMarker = L.marker(data.results[i].latlng, { icon: iconVar }).bindPopup(data.results[i].properties.LongLabel);
        this.resultsLayersGroup.addLayer(resultMarker);
      }
    });

    L.control.locate({ setView: 'untilPanOrZoom', flyTo: false }).addTo(this.mappingService.map);
    let nodeList = document.querySelectorAll<HTMLElement>(
      '.leaflet-control-locate.leaflet-bar.leaflet-control .leaflet-bar-part.leaflet-bar-part-single span'
    );
    Array.from(nodeList).forEach((el) => {
      el.classList.remove('fa-map-marker');
      el.classList.add('fa-crosshairs');
    });

    nodeList = document.querySelectorAll<HTMLElement>(
      '.easy-button-button.leaflet-bar-part.leaflet-interactive.unnamed-state-active'
    );
    Array.from(nodeList).forEach((el) => {
      el.style.width = '30px';
      el.style.height = '30px';
    });

    this.centerOnCity();
  }
  loadThreatLayers(layerType: string) {
    this.mappingService.cities
      .find((x) => x.name === this.actualCityName)
      .layers.forEach((layer) => {
        if (layer.fixed && layerType !== 'Ninguna') {
          layer.gJSON.setStyle({ color: layer.color, fill: false });
          // layer.gJSON.setStyle({ color: '#000000', fill: false });
          layer.gJSON.addTo(this.mappingService.map);
        }
        if (layer.fixed && layerType === 'Ninguna') {
          layer.gJSON.setStyle({ color: layer.color, fill: false });
        }
        layer.threadType.forEach((threat) => {
          if (this.actualCityThreats.find((x) => x === threat) === undefined && threat !== 'Ninguna' && threat !== '') {
            this.actualCityThreats.push(threat);
            this.threatsOnBar.push({
              title: threat,
              iconName: '/assets/icon/' + String(threat).replace(' ', '') + '_negro.svg',
              pushed: false,
            });
            console.log(this.threatsOnBar);
          }
          if (threat === layerType) {
            this.overlayMaps[layer.layerName] = layer.gJSON;
            layer.gJSON.addTo(this.mappingService.map);
          }
        });
      });
    // Load layers with 'Ninguna' on ThreatType
    if (this.overlayMaps) {
      Object.keys(this.overlayMaps).forEach((key) => {
        this.mappingService.map.addLayer(this.overlayMaps[key]);
      });
      // this.layerControl = L.control.layers(null, this.overlayMaps);
      // this.layerControl.addTo(this.mappingService.map);
      this.actualThreatName = layerType;
    }
  }
  loadThreatBar() {}
  centerOnCity() {
    // this.mappingService.map.flyTo(this.mappingService.cities[this.actualCity].location,
    // this.mappingService.cities[this.actualCity].zoomLevel);
    this.mappingService.map.setView(this.mappingService.initialView.location, this.mappingService.initialView.zoomLevel);
    this.putCityMarkers();
  }
  toggleSearchBar() {
    this.searchBarActive = !this.searchBarActive;
  }
  getPlaces(ev: any) {
    const input = ev.target.value;
    if (input && input.trim() !== '') {
      this.mappingService.searchPlaces = [];
      this.areCitiesAvailable = true;
      this.mappingService.searchProvider.search({ query: input }).then((results) => {
        results.forEach((result) => {
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
      this.mappingService.searchMarker.addTo(this.mappingService.map).bindPopup(place.label).openPopup();
      this.mappingService.map.flyTo([Number(place.y), Number(place.x)], 11);
      this.isMarkerActive = true;
    }
    this.mappingService.searchPlaces = [];
    this.areCitiesAvailable = false;
  }
  ngOnInit() {}
  async generalInfo() {
    let messageString: string;
    if (this.actualCityName === 'Chacao') {
      messageString =
        '<em>Municipio Chacao</em> <br/> \
      Estado	Miranda <br/> \
      N_Parro	1 <br/> \
      A_hect	873,66 <br/> \
      Perimetro	13,03 ';
    } else if (this.actualCityName === 'Cumaná') {
      messageString = '<em>Ciudad de Cumaná</em> <br/> \
      Area (km2)	64,41 <br/> \
      Perimetro (km)	47,53';
    } else if (this.actualCityName === 'Mérida') {
      messageString = '<em>Ciudad de Mérida</em> <br/> \
      Area (km2)	96,28 <br/> \
      Perimetro (km)	52,01';
    }
    const alert = await this.alertController.create({
      header: 'Información General',
      message: messageString,
      buttons: ['Aceptar'],
    });

    await alert.present();
  }
  async location() {
    let messageString: string;
    if (this.actualCityName === 'Chacao') {
      messageString =
        'El municipio Chacao es uno de los 21 municipios del estado Miranda y uno de los 5 municipios \
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
    } else if (this.actualCityName === 'Cumaná') {
      messageString = 'Info de Cumaná';
    } else if (this.actualCityName === 'Mérida') {
      messageString = 'Info de Mérida';
    }
    const alert = await this.alertController.create({
      header: 'Ubicación',
      message: messageString,
      buttons: ['Aceptar'],
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
      if (this.actualCityThreats.length !== 0) {
        this.actualThreatName = this.actualCityThreats[0];
        this.loadThreatLayers(this.actualThreatName);
      } else {
        this.actualThreatName = 'No hay datos';
      }
    }
  }
  loadThreat(threat: string) {
    console.log(this.threatsOnBar);
    this.removeLayerControl();
    if (!this.threatsOnBar.find((x) => x.title === threat).pushed) {
      // Release all others buttons
      // change all other icons to black
      // put this icon to color
      this.threatsOnBar.forEach((t) => {
        if (t.title !== threat) {
          t.pushed = false;
          t.iconName = '/assets/icon/' + String(t.title).replace(' ', '') + '_negro.svg';
        } else {
          t.pushed = true;
          t.iconName = '/assets/icon/' + String(t.title).replace(' ', '') + '_color.svg';
        }
      });
      this.loadThreatLayers(threat);
    } else {
      this.loadThreatLayers('Ninguna');
    }
  }

  nextThreat() {
    let index = this.actualCityThreats.indexOf(this.actualThreatName);
    if (index === this.actualCityThreats.length - 1) {
      this.actualThreatName = this.actualCityThreats[0];
    } else {
      index += 1;
      this.actualThreatName = this.actualCityThreats[index];
    }
    this.removeLayerControl();
    if (this.actualCityThreats.length !== 0) {
      this.loadThreatLayers(this.actualThreatName);
    } else {
      this.actualThreatName = 'No hay datos';
    }
  }
  previousThreat() {
    let index = this.actualCityThreats.indexOf(this.actualThreatName);
    if (index === 0) {
      this.actualThreatName = this.actualCityThreats[this.actualCityThreats.length - 1];
    } else {
      index -= 1;
      this.actualThreatName = this.actualCityThreats[index];
    }
    this.removeLayerControl();
    if (this.actualCityThreats.length !== 0) {
      this.loadThreatLayers(this.actualThreatName);
    } else {
      this.actualThreatName = 'No hay datos';
    }
  }
  async showInfo(titleString: string, bodyString: string) {
    const infoModal = await this.modalController.create({
      component: InfoPageComponent,
      componentProps: {
        title: titleString,
        body: bodyString,
      },
      cssClass: 'info-custom-modal-css',
    });
    return await infoModal.present();
  }
  clickFab() {
    this.menu.enable(false);
    if (this.actualCity === 0) {
      const title = 'Información del Proyecto';
      const body = `
      <div class="logo">
        <img src="/assets/logo.png" style="height: 100px;" />
      </div>
      <h3>¡Bienvenido(a) a Appmenazas!</h3>
      <p>
        Gracias por utilizar Appmenazas V1.0, una aplicación creada con la intención de socializar información existente sobre los
        distintos tipos y niveles de exposición a amenazas de origen natural, que han sido identificados para diversas ciudades
        venezolanas.
      </p>
      <p>
        Con esta herramienta usted podrá conocer datos disponibles sobre el nivel de exposición específico a diversos tipos de
        amenazas de origen natural, que han sido estimados para cada lugar de su ciudad, así como algunas recomendaciones generales
        que podrían minimizar sus niveles de riesgo en ese respectivo lugar.
      </p>
      <h3>Descarga de responsabilidad</h3>
      <p>
        Todos los datos que son presentados en los distintos módulos de esta aplicación son extraídos de estudios rigurosos, que han
        sido publicados por investigadores y especialistas destacados de distintas disciplinas, vinculadas a la caracterización de
        escenarios de riesgos socionaturales urbanos. Estas fuentes originales pueden ser descargadas desde la aplicación.
      </p>
      <p>
        Los datos generales y las recomendaciones que se brindan para cada espacio urbano que es consultado en esta herramienta, deben
        ser asumidos como indicaciones generales y NO OFICIALES, puesto que han sido elaborados exclusivamente con intención
        divulgativa.
      </p>
      <p>
        En ningún caso los datos que aquí se suministran sobre una localización urbana particular deben ser asumidos como sustitutos
        validos de los estudios técnicos detallados, que pudieran requerirse para caracterizar profesional e íntegramente los niveles
        de amenaza/riesgos establecidos para dicho espacio.
      </p>
      <p>
        Se declara en función de lo anterior que, el equipo de desarrollo de Appmenazas 1.0 se exime de toda responsabilidad que
        pudiera devenir producto de aseveraciones hechas en esta aplicación que contravengan total o parcialmente opiniones de
        terceros.
      </p>`;
      this.showInfo(title, '<hr />' + body);
    }
    this.menu.enable(true);
  }
}
