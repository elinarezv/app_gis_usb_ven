import { Component, OnInit } from '@angular/core';
import { ModalController, MenuController, NavController, Platform, Events } from '@ionic/angular';
import { RegisterPage } from '../auth/register/register.page';
import { LoginPage } from '../auth/login/login.page';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';
@Component({
  selector: 'app-lading2',
  templateUrl: './lading2.page.html',
  styleUrls: ['./lading2.page.scss'],
})
export class Lading2Page implements OnInit {

  constructor( private modalController: ModalController, private menu: MenuController, private authService: AuthService, private navCtrl: NavController, private platform: Platform, public events: Events, public router:Router,){
    this.menu.enable(false);
  }

  ngOnInit(){
   
  }
  

}
