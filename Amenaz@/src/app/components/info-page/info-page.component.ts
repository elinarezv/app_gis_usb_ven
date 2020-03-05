import { Component, OnInit } from '@angular/core';
import { ModalController, MenuController, NavParams } from '@ionic/angular';

@Component({
  selector: 'app-info-page',
  templateUrl: './info-page.component.html',
  styleUrls: ['./info-page.component.scss']
})
export class InfoPageComponent implements OnInit {
  public title: string;
  public body: string;

  constructor(private modalController: ModalController, private menu: MenuController, private navParams: NavParams) {
    this.title = this.title ? this.title : '';
    this.body = this.body ? this.body : '';
  }

  dimissComponent() {
    this.modalController.dismiss();
  }

  ngOnInit() {
    if (document.getElementById('component-body')) {
      document.getElementById('component-body').innerHTML = this.body;
    }
  }
}
