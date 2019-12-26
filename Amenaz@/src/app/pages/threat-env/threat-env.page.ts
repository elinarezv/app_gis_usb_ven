import { Component, OnInit } from '@angular/core';
import { MenuController, NavController } from '@ionic/angular';
import { Map, tileLayer, Layer, control, marker, icon, geoJSON } from 'leaflet';
import { AuthService } from 'src/app/services/auth.service';
import { AlertService } from 'src/app/services/alert.service';
import { MappingService } from 'src/app/services/mapping.service';

@Component({
  selector: 'app-threat-env',
  templateUrl: './threat-env.page.html',
  styleUrls: ['./threat-env.page.scss']
})
export class ThreatEnvPage implements OnInit {
  threadEnvMap: Map;

  constructor(
    private menu: MenuController,
    private navCtrl: NavController,
    private authService: AuthService,
    private alertService: AlertService,
    private mappingService: MappingService
  ) {}

  mainScreenMap() {
    // Center Map on Venezuela
    this.threadEnvMap = new Map('mapIdEnvThreads').setView([8.031, -65.346], 5);
    this.mappingService.mainCityMarker.addTo(this.threadEnvMap);
    this.mappingService.threadBaseMap.addTo(this.threadEnvMap);

    // console.log(this.getGeolocation());

    // Add all thread layers
    // this.threadEnvMap.flyTo(this.mappingService.mainCity, 12);
  }
  ionViewDidEnter() {
    this.mainScreenMap();
  }
  ionViewWillLeave() {
    this.threadEnvMap.remove();
  }
  ngOnInit() {}
}
