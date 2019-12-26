import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class EnvService {
  API_URL = 'https://ionic-server.datomtravel-pe.com:8088/';

  constructor() {}
}
