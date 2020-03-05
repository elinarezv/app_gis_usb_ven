import { Component, OnInit } from '@angular/core';
import { Events, NavParams, PopoverController } from '@ionic/angular';

interface Segment {}

@Component({
  selector: 'app-legend',
  templateUrl: './legend.component.html',
  styleUrls: ['./legend.component.scss']
})
export class LegendComponent implements OnInit {
  page;

  constructor(private events: Events, private navParams: NavParams, private popoverController: PopoverController) {}

  ngOnInit() {
    // Get data from popover page
    this.page = this.navParams.get('data');
  }
  wifiSetting() {
    // code for setting wifi option in apps
  }

  logout() {
    // code for logout
  }

  eventFromPopover() {
    this.events.publish('fromPopoverEvent');
    this.popoverController.dismiss();
  }
}
