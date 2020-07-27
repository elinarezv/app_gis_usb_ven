import { Component, OnInit } from '@angular/core';
import { ModalController, NavController } from '@ionic/angular';
import { LoginPage } from '../login/login.page';
import { AuthService } from 'src/app/services/auth.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertService } from 'src/app/services/alert.service';
import { UsernameValidator } from 'src/app/validators/username';
import { RegisterPage } from '../register/register.page';

@Component({
  selector: 'app-recover',
  templateUrl: './recover.page.html',
  styleUrls: ['./recover.page.scss'],
})
export class RecoverPage implements OnInit {
  public recoverForm: FormGroup;

  constructor(
    private modalController: ModalController,
    private authService: AuthService,
    private navCtrl: NavController,
    private alertService: AlertService,
    public formBuilder: FormBuilder
  ) {
    this.recoverForm = formBuilder.group({
      email: [
        '',
        Validators.compose([
          Validators.maxLength(80),
          Validators.minLength(3),
          Validators.pattern(
            /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
          ),
          Validators.required,
        ]),
      ],
    });
  }
  ngOnInit() {}
  dismissRecover() {
    this.modalController.dismiss();
  }
  async registerModal() {
    this.dismissRecover();
    const registerModal = await this.modalController.create({
      component: RegisterPage,
    });
    return await registerModal.present();
  }
  recoverPassword() {
    const message = `En caso de estar registrado el correo se enviará un
     mensaje con instrucciones para la recuperación de la contraseña.`;
    this.alertService.presentToast(message, 1200);
    this.authService.recover(this.recoverForm.controls.email.value).subscribe(
      (data) => {
        console.log(data);
        this.alertService.presentToast(data, 800);
      },
      (error) => {
        console.log(error);
        this.alertService.presentToast('Se ha enviado un correo electrónico a esa dirección de correo.', 1600);
        this.dismissRecover();
      }
    );
  }
}
