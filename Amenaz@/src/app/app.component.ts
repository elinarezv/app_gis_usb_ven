import { Component } from '@angular/core';

import { Platform, NavController, Events } from '@ionic/angular';
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
      title: 'Sitio Web',
      url: '/home',
      icon: 'home'
    },
    {
      title: 'Configuración',
      url: '/myaccount',
      icon: 'settings'
    },
    {
      title: 'Compartir',
      url: '/myaccount',
      icon: 'share'
    },
    {
      title: 'Acerca de',
      url: '/credits',
      icon: 'information-circle'
    }
  ];
  public userName = 'Testin123';
  public email = '';

  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private authService: AuthService,
    private navCtrl: NavController,
    private alertService: AlertService,
    public events: Events
  ) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(
      () => {
        this.statusBar.styleDefault();
        this.splashScreen.hide();
        this.authService.getToken();
      });
    this.events.subscribe('user-login',
      (data) => {
        console.log('Event called');
        this.userName = data.firstname + ' ' + data.lastname;
        this.email = data.email;
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
