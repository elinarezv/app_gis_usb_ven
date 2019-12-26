import { Component, OnInit } from '@angular/core';
import { ModalController, NavController } from '@ionic/angular';
import { LoginPage } from '../login/login.page';
import { AuthService } from 'src/app/services/auth.service';
import { NgForm } from '@angular/forms';
import { AlertService } from 'src/app/services/alert.service';
@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss']
})
export class RegisterPage implements OnInit {
  public actNotify: boolean = true;
  public termAccept: boolean = false;
  private activateRegisterButton: boolean = true;

  constructor(
    private modalController: ModalController,
    private authService: AuthService,
    private navCtrl: NavController,
    private alertService: AlertService
  ) {}

  ngOnInit() {}
  dismissRegister() {
    this.modalController.dismiss();
  }
  async loginModal() {
    this.dismissRegister();
    const loginModal = await this.modalController.create({
      component: LoginPage
    });
    return await loginModal.present();
  }
  notify() {
    this.actNotify = !this.actNotify;
  }
  notifyTermsCond() {
    this.termAccept = !this.termAccept;
  }
  register(form: NgForm) {
    this.termAccept = false;
    this.alertService.presentToast('Conectando al servidor...');
    this.authService
      .register(
        form.value.fName,
        form.value.lName,
        form.value.addr,
        form.value.email,
        form.value.password,
        String(this.actNotify)
      )
      .subscribe(
        data => {
          this.authService.login(form.value.email, form.value.password).subscribe(
            data => {},
            error => {
              this.termAccept = true;
              console.log(error);
            },
            () => {
              this.dismissRegister();
              this.navCtrl.navigateRoot('/home');
            }
          );
          this.alertService.presentToast(data['message']);
        },
        error => {
          this.termAccept = true;
          console.log(error);
        },
        () => {}
      );
  }
}
