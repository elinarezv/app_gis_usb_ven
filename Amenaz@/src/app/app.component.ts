import { Component } from '@angular/core';

import { Platform, NavController, Events } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { AuthService } from './services/auth.service';
import { AlertService } from './services/alert.service';

import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
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
    private socialShare: SocialSharing,
    private iab: InAppBrowser
  ) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(
      () => {
        // To show the Status Bar must replace styleDfault with styleLightContent
        // this.statusBar.styleDefault();
        this.statusBar.styleLightContent()
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
  gotoWebsite() {
    const browser = this.iab.create('https://www.lsigma.ea.usb.ve/');
    browser.show();
  }
  config() {
    this.navCtrl.navigateForward('/myaccount');
  }
  share() {
    this.socialShare.share("https://play.google.com/store/apps/details?id=com.android.chrome&hl=en_us");
  }
  about() {
    this.navCtrl.navigateForward('/credits');
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
