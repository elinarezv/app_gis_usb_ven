import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IonRadioGroup } from '@ionic/angular';

import { AuthService } from '../../services/auth.service';
import { AlertService } from '../../services/alert.service';
import { NavController } from '@ionic/angular';
import { MappingService } from 'src/app/services/mapping.service';

import * as L from 'leaflet';

@Component({
  selector: 'app-myaccount',
  templateUrl: './myaccount.page.html',
  styleUrls: ['./myaccount.page.scss']
})
export class MyaccountPage implements OnInit {
  @ViewChild('basemapRadioGroup', { static: true }) radioGroup: IonRadioGroup;

  public accountForm: FormGroup;
  public submitAttempt: boolean = false;
  public formDataChanged: boolean = false;

  constructor(
    public formBuilder: FormBuilder,
    private authService: AuthService,
    private navCtrl: NavController,
    private alertService: AlertService,
    private mappingService: MappingService
  ) {
    this.accountForm = formBuilder.group({
      firstname: [
        '',
        Validators.compose([
          Validators.maxLength(30),
          Validators.minLength(2),
          Validators.pattern('[a-zA-Z ]*'),
          Validators.required
        ])
      ],
      lastname: [
        '',
        Validators.compose([
          Validators.maxLength(30),
          Validators.minLength(2),
          Validators.pattern('[a-zA-Z ]*'),
          Validators.required
        ])
      ],
      address: ['']
    });
    this.accountForm.controls.firstname.setValue(this.authService.token.firstname);
    this.accountForm.controls.lastname.setValue(this.authService.token.lastname);
    this.accountForm.controls.address.setValue(this.authService.token.address);
  }
  save() {
    this.alertService.presentToast('Conectando al servidor...');
    this.formDataChanged = false;
    this.authService
      .update(
        this.accountForm.controls.firstname.value,
        this.accountForm.controls.lastname.value,
        this.accountForm.controls.address.value
      )
      .subscribe(
        data => {
          this.alertService.presentToast(data['message']);
        },
        error => {
          this.alertService.presentToast(error['message']);
          this.formDataChanged = false;
          console.log(error);
        },
        () => {}
      );
  }
  setBaseMap(baseMap: string) {
    this.mappingService.map.removeLayer(this.mappingService.baseMap);
    if (baseMap === 'esri-vial') {
      const urlMap = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}';
      this.mappingService.baseMap = L.tileLayer(urlMap, {
        id: 'mapId',
        attribution: 'www.usb.ve MIT License',
        maxZoom: 16
      });
      this.mappingService.baseMapName = 'esri-vial';
    } else if (baseMap === 'esri-sat') {
      this.mappingService.baseMap = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        {
          id: 'mapId',
          attribution: 'www.usb.ve MIT License'
          // maxZoom: 16
        }
      );
      this.mappingService.baseMapName = 'esri-sat';
    } else {
      this.mappingService.baseMap = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
        {
          id: 'mapId',
          attribution: 'www.usb.ve MIT License',
          maxZoom: 16
        }
      );
      this.mappingService.baseMapName = 'esri-dark';
    }
  }
  formChanged() {
    this.formDataChanged = true;
  }
  ngOnInit() {}
  ionViewDidEnter() {
    this.radioGroup.value = this.mappingService.baseMapName;
  }
}
