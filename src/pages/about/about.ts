import { Component } from '@angular/core';
import {DataProvider} from "../../providers/data/data";
import {TravelCenterProvider} from "../../providers/travel-center/travel-center";
import {NavController, Events, NavParams} from 'ionic-angular';
import * as $ from "jquery";

@Component({
  selector: 'page-about',
  templateUrl: 'about.html'
})
export class AboutPage {
  public station: any;
  public dropdowns: boolean[] = [false, false, false];
  public tc: any;

  constructor(public navCtrl: NavController, public events: Events, public TC: TravelCenterProvider, public navParams: NavParams, public data: DataProvider) {
    this.dropdowns[0] = false;
    this.dropdowns[1] = false;
    this.dropdowns[2] = false;

    this.station = data.aktStation;

    // this.loadTC(this.station.number);
    this.loadTC();

    events.subscribe('station:changed', (station) => {
      console.log("Detailansicht: Bahnhof aktualisiert");
      this.station = station;
    });
  }

  loadTC() {
    for (let eN of this.station.evaNumbers) {
      if (eN.isMain) {
        let coords = eN.geographicCoordinates.coordinates;

        this.TC.load(coords[1],coords[0]).then(data => {
          this.tc = data[0];
          console.log("TravelCenter");
          console.log(this.tc);
        });
      }
    }
  }

  ionViewWillEnter() {
    this.station =  this.data.aktStation;
  }

  openKarte() {
    this.navCtrl.parent.select(0);
  }

  openDropdown(service) {
    let id;
    if (service == 'parking') {
      id = 0;
    } else if (service == 'travelCenter') {
      id = 1;
    } else if (service == 'availability') {
      id = 2;
    } else return null;

    this.dropdowns[id] = !this.dropdowns[id];
    if(this.dropdowns[id] == true) {
      $('#' + service + 'Dropdown').css('max-height', '1000px');
      $('#' + service + 'Dropdown').css('display', 'block');
    } else {
      $('#' + service + 'Dropdown').css('max-height', '0px'); // funktionier nicht. Warum?!
      $('#' + service + 'Dropdown').css('display', 'none');
    }
  }

}
