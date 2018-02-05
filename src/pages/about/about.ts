import { Component } from '@angular/core';
import { NavController, Events } from 'ionic-angular';
import * as $ from "jquery";

@Component({
  selector: 'page-about',
  templateUrl: 'about.html'
})
export class AboutPage {
  public station: any;
  public dropdowns: boolean[] = [false, false];

  constructor(public navCtrl: NavController, public events: Events) {
    this.dropdowns[0] = false;
    this.dropdowns[1] = false;

    events.subscribe('station:changed', (station) => {
      console.log("Detailansicht: Bahnhof aktualisiert");
      this.station = station;
    });
  }

  openKarte() {
    this.navCtrl.parent.select(0);
  }

  openDropdown(service) {
    let id;
    if (service == 'parking') {
      id = 0;
    } else if (service == 'travelCenter') {
      id = 1
    } else return null;

    this.dropdowns[id] = !this.dropdowns[id];
    if(this.dropdowns[id] == true) {
      $('#' + service + 'Dropdown').css('max-height', '1000px');
    } else {
      $('#' + service + 'Dropdown').css('max-height', '0px');
    }
  }

}
