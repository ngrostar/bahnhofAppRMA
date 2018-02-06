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
  pps: any;
  public spaceID:any;
  public space:any;

  constructor(public navCtrl: NavController, public data: DataProvider, public events: Events, public Parkplatz:ParkplatzProvider) {
    this.loadParkplatz('spaces');

    this.station = this.data.aktStation;

    this.loadParkplatz('spaces/occupancies');

    events.subscribe('station:changed', (station) => {
      this.station = station;
        this.spaceID=this.gibID();
        console.log(this.spaceID);
        if(this.spaceID!=0){
            this.loadParkplatz2('spaces/'+this.spaceID);
        }

    });
  }

  openKarte() {
    this.navCtrl.parent.select(0);
  }

    loadParkplatz(param){
        this.Parkplatz.load(param).then(data => {

            this.pps = data['allocations'];
            console.log("Parkplätze ohne Belegungen");
            console.log(this.pps);
        });
    }
    loadParkplatz2(param){
        this.Parkplatz.load(param).then(data => {

            this.space = data;
            console.log("Einzelner Parkplatz");
            console.log(this.space);
        });
    }
    gibID(){
      for(let pp of this.pps){
          //console.log("Parkplatz Station ID"+pp.space.station.id);
          if(this.station.number==pp.space.station.id){
              console.log(pp.space.title);
              return pp.space.id;
          }
      }
      return 0;
    }

}
