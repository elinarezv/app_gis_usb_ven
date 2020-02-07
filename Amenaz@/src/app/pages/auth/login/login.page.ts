import { Component, OnInit } from '@angular/core';
import { ModalController, NavController, Events } from '@ionic/angular';
import { RegisterPage } from '../register/register.page';
import { NgForm } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';
import { AlertService } from 'src/app/services/alert.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss']
})
export class LoginPage implements OnInit {
  activateLoginButton: boolean;
  constructor(
    private modalController: ModalController,
    private authService: AuthService,
    private navCtrl: NavController,
    private alertService: AlertService,
    public events: Events
  ) {
    this.activateLoginButton = true;
  }
  ngOnInit() { }

  dismissLogin() {
    this.modalController.dismiss();
  }
  async registerModal() {
    this.dismissLogin();
    const registerModal = await this.modalController.create({
      component: RegisterPage
    });
    return await registerModal.present();
  }
  login(form: NgForm) {
    this.activateLoginButton = false;
    this.alertService.presentToast('Iniciando sesión en servidor...', 800);
    this.authService.login(form.value.email, form.value.password).subscribe(
      data => {
        this.events.publish('user-login', data);
        this.alertService.presentToast('Sesión iniciada');
      },
      error => {
        this.activateLoginButton = true;
        console.log(error);
        let message = error.message;
        if (String(error.message).includes('Unknown Error')) {
          message = 'No se puede contactar al servidor de Aplicación';
        }
        if (String(error.message).includes('Unauthorized') || String(error.message).includes('404 Not Found') || String(error.message).includes('500 Internal Server Error')) {
          message = 'Datos inválidos';
        }
        this.alertService.presentToast('Error inicio de sesión: ' + message);
      },
      () => {
        this.dismissLogin();
        this.navCtrl.navigateRoot('/home');
      }
    );
  }
}
