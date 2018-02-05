import { Component } from '@angular/core';
import {Events, NavController} from 'ionic-angular';

@Component({
  selector: 'page-contact',
  templateUrl: 'contact.html'
})
export class ContactPage {
  public station: any;

  constructor(public navCtrl: NavController, public events: Events) {

    events.subscribe('station:changed', (station) => {
      this.station = station;
    });
  }

  openKarte() {
    this.navCtrl.parent.select(0);
  }

}
