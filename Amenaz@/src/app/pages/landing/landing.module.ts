import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { LandingPage } from './landing.page';
import { LoginPage } from '../auth/login/login.page';
import { RegisterPage } from '../auth/register/register.page';
import { RecoverPage } from '../auth/recover/recover.page';

const routes: Routes = [
  {
    path: '',
    component: LandingPage,
  },
];

@NgModule({
  imports: [CommonModule, ReactiveFormsModule, FormsModule, IonicModule, RouterModule.forChild(routes)],
  declarations: [LandingPage, LoginPage, RegisterPage, RecoverPage],
  entryComponents: [LoginPage, RegisterPage, RecoverPage],
})
export class LandingPageModule {}
