import { Component, OnInit } from '@angular/core';
import { ModalController, NavController } from '@ionic/angular';
import { LoginPage } from '../login/login.page';
import { AuthService } from 'src/app/services/auth.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertService } from 'src/app/services/alert.service';
import { UsernameValidator } from 'src/app/validators/username';
import { RecoverPage } from '../recover/recover.page';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage implements OnInit {
  public actNotify: boolean = true;
  public termAccept: boolean = false;
  private activateRegisterButton: boolean = true;
  public accountForm: FormGroup;
  public submitAttempt: boolean = false;
  private usernameTaken: boolean = false;

  constructor(
    private modalController: ModalController,
    private authService: AuthService,
    private navCtrl: NavController,
    private alertService: AlertService,
    public formBuilder: FormBuilder,
    private usernameValidator: UsernameValidator
  ) {
    this.accountForm = formBuilder.group({
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
        usernameValidator.verifyEmail.bind(usernameValidator),
      ],
      password: [''],
      notifications: [''],
    });
  }

  ngOnInit() {}
  dismissRegister() {
    this.modalController.dismiss();
  }
  async loginModal() {
    this.dismissRegister();
    const loginModal = await this.modalController.create({
      component: LoginPage,
    });
    return await loginModal.present();
  }
  notify() {
    this.actNotify = !this.actNotify;
  }
  notifyTermsCond() {
    this.termAccept = !this.termAccept;
  }
  register() {
    this.termAccept = false;
    this.alertService.presentToast('Conectando al servidor...', 800);
    this.authService
      .register(this.accountForm.controls.email.value, this.accountForm.controls.password.value, String(this.actNotify))
      .subscribe(
        (data) => {
          this.authService.login(this.accountForm.controls.email.value, this.accountForm.controls.password.value).subscribe(
            (data) => {},
            (error) => {
              this.submitAttempt = true;
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
        (error) => {
          this.termAccept = false;
          this.alertService.presentToast(error['error']);
          console.log(error);
        },
        () => {}
      );
  }
}
