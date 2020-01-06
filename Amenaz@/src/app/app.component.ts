import { Component } from '@angular/core';

import { Platform, NavController } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { AuthService } from './services/auth.service';
import { AlertService } from './services/alert.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent {
  public appPages = [
    {
      title: 'Inicio',
      url: '/home',
      icon: 'home'
    },
    {
      title: 'Mi Cuenta',
      url: '/myaccount',
      icon: 'person'
    },
    {
      title: 'Mapa de Amenaz@s',
      url: '/threat-map',
      icon: 'compass'
    },
    {
      title: 'Entorno de Amenaz@s',
      url: '/threat-env',
      icon: 'pulse'
    },
    {
      title: 'Notificaciones',
      url: '/notifications',
      icon: 'notifications'
    },
    {
      title: 'Créditos',
      url: '/credits',
      icon: 'ribbon'
    },
    {
      title: 'Política de Privacidad',
      url: '/privacy',
      icon: 'share'
    }
  ];

  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private authService: AuthService,
    private navCtrl: NavController,
    private alertService: AlertService
  ) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      // this.splashScreen.hide();
      this.authService.getToken();
    });
  }
  logout() {
    this.authService.logout().subscribe(
      data => {
        this.alertService.presentToast(data['message']);
      },
      error => {
        console.log(error);
      },
      () => {
        this.navCtrl.navigateRoot('/landing');
      }
    );
  }
}
