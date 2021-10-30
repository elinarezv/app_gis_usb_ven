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
  styleUrls: ['app.component.scss'],
})
    
export class AppComponent {
  public appPages = [
    {
      title: 'Sitio Web',
      url: '/home',
      icon: 'home',
    },
    {
      title: 'Configuración',
      url: '/myaccount',
      icon: 'settings',
    },
    {
      title: 'Acerca de',
      url: '/credits',
      icon: 'information-circle',
    },
  ];
  public userName = '';
  public email = '';
  public partnerProfileImageURL: any;

  constructor( private platform: Platform, private splashScreen: SplashScreen, private statusBar: StatusBar, private authService: AuthService, private navCtrl: NavController, private alertService: AlertService, public events: Events,
    private socialShare: SocialSharing, private iab: InAppBrowser
  ) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      // To show the Status Bar must replace styleDfault with styleLightContent
      // this.statusBar.styleDefault();
      this.statusBar.styleLightContent();
      setTimeout(() => {
        this.splashScreen.hide();
      }, 10000);
    });
    this.events.subscribe('user-login', (data) => {
      // this.userName = data.firstname + ' ' + data.lastname;
      this.email = data.email;
      // this.partnerProfileImageURL = this.getInitials(this.userName);
    });
    setTimeout(()=>{
     this.session();
     },1000);
  }
  gotoWebsite(url: string, setRoot: boolean = false) {
    if (!url || url === '') {
      return;
    }
    if (url.includes('http')) {
      console.log(url);
      const browser = this.iab.create(url);
      browser.show();
    } else {
      if (setRoot) {
        this.navCtrl.navigateRoot(url);
      } else {
        this.navCtrl.navigateForward(url);
      }
    }
  }
  share() {
    this.socialShare.share('https://play.google.com/store/apps/details?id=com.android.chrome&hl=en_us');
  }
  logout() {
    this.authService.logout().subscribe(
      (data) => {
        this.alertService.presentToast(data['message']);
      },
      (error) => {
        console.log(error);
      },
      () => {
        debugger
        this.navCtrl.navigateRoot('/landing');
      }
    );
  }
  getInitials(name: string) {
    if (!name || name === '') {
      return false;
    }
    const names = name.split(' ');
    let first, last;
    if (names.length === 1) {
      first = names[0][0];
      last = '';
    } else if (names.length === 2) {
      first = names[0][0];
      last = names[1][0];
    } else {
      first = names[0][0];
      last = names[2][0];
    }
    const canvas = document.createElement('canvas');
    canvas.style.display = 'none';
    canvas.width = 32;
    canvas.height = 32;
    document.body.appendChild(canvas);
    const context = canvas.getContext('2d');
    context.fillStyle = '#999';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.font = '18px Arial';
    context.fillStyle = '#fff';
    if (last) {
      const initials = first + last;
      context.fillText(initials.toUpperCase(), 4, 23);
    } else {
      const initials = first;
      context.fillText(initials.toUpperCase(), 12, 23);
    }
    const data = canvas.toDataURL();
    document.body.removeChild(canvas);
    return data;
  }
  session(){
    let usuario=JSON.parse(localStorage.getItem('userappemanzas'));
    if(usuario!=null || usuario!=undefined){
      this.events.publish('user-login', usuario);
      this.authService.token=usuario.token;
      this.navCtrl.navigateRoot('home');
    }else{
     this.navCtrl.navigateRoot('/landing');
    }
  }
}
