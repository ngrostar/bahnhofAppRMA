import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import {ParkplatzProvider} from "../../providers/parkplatz/parkplatz";
@Component({
  selector: 'page-contact',
  templateUrl: 'contact.html'
})
export class ContactPage {

  constructor(public navCtrl: NavController, public Parkplatz:ParkplatzProvider) {
    this.loadParkplatz('spaces');
  }
  pp:any;
    loadParkplatz(param) {
        this.Parkplatz.load(param).then(data => {

            this.pp = data['result'];
            console.log("Parkplätze");
            console.log(this.pp);
        });
    }

}
