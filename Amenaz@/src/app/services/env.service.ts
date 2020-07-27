import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class EnvService {
  API_URL = 'https://www.appmenazas.com:8088/';
  USE_ESRI_BASEMAPS = false;

  constructor() {}
}
