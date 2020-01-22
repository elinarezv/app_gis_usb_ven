import { Component } from '@angular/core';

import { Platform, NavController, Events } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { AuthService } from './services/auth.service';
import { AlertService } from './services/alert.service';

import { SocialSharing } from '@ionic-native/social-sharing/ngx';

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
      title: 'Acerca de',
      url: '/credits',
      icon: 'information-circle'
    }
  ];
  public userName = '';
  public email = '';

  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private authService: AuthService,
    private navCtrl: NavController,
    private alertService: AlertService,
    public events: Events,
    private socialShare: SocialSharing
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
  share() {
    console.log('Sharing...');
    this.socialShare.share("https://play.google.com/store/apps/details?id=com.android.chrome&hl=en_us");
  }
}
