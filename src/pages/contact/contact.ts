import { Component } from '@angular/core';
import {ParkplatzProvider} from "../../providers/parkplatz/parkplatz";
import {Events, NavController} from 'ionic-angular';
import {DataProvider} from "../../providers/data/data";

@Component({
  selector: 'page-contact',
  templateUrl: 'contact.html'
})
export class ContactPage {
  public station: any;
  pp: any;

  constructor(public navCtrl: NavController, public data: DataProvider, public events: Events, public Parkplatz:ParkplatzProvider) {
    this.loadParkplatz('spaces');

    this.station = this.data.aktStation;

    events.subscribe('station:changed', (station) => {
      this.station = station;
    });
  }

  openKarte() {
    this.navCtrl.parent.select(0);
  }

    loadParkplatz(param) {
        this.Parkplatz.load(param).then(data => {

            this.pp = data['result'];
            console.log("Parkplätze");
            console.log(this.pp);
        });
    }

}
