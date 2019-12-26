import { Component, OnInit } from '@angular/core';
import { ModalController, NavController } from '@ionic/angular';
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
    private alertService: AlertService
  ) {
    this.activateLoginButton = true;
  }
  ngOnInit() {}

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
    this.alertService.presentToast('Iniciando sesión en servidor...');
    this.authService.login(form.value.email, form.value.password).subscribe(
      data => {
        this.alertService.presentToast('Sesión iniciada');
        console.log(data);
      },
      error => {
        this.activateLoginButton = true;
        console.log(error);
        this.alertService.presentToast('Error inicio de sesión: ' + error.error);
      },
      () => {
        this.dismissLogin();
        this.navCtrl.navigateRoot('/home');
      }
    );
  }
}
