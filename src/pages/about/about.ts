import { Component } from '@angular/core';
import { NavController, Events } from 'ionic-angular';

@Component({
  selector: 'page-about',
  templateUrl: 'about.html'
})
export class AboutPage {
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
