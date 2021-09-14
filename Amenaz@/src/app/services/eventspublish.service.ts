import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EventspublishService {
  private userLoginSource = new Subject();
  private citiesLoadesSource = new Subject();
  private fromPopOverSource = new Subject();

  userLoginSource$ = this.userLoginSource.asObservable();
  citiesLoadedSource$= this.citiesLoadesSource.asObservable();
  fromPopOverSource$= this.fromPopOverSource.asObservable();

  constructor() { }

  publishUserLogin(data){
    this.userLoginSource.next(data);
  }

  publishCitiesLoaded(){
    this.citiesLoadesSource.next();
  }

  publishfromPopOver(){
    this.fromPopOverSource.next();
  }
}
