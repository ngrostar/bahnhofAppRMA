import {Component} from '@angular/core';
import {ParkplatzProvider} from "../../providers/parkplatz/parkplatz";
import {Events, NavController} from 'ionic-angular';
import {DataProvider} from "../../providers/data/data";
import {PushPage} from "../push/push";
import {LoadingController} from "ionic-angular";


@Component({
    selector: 'page-contact',
    templateUrl: 'contact.html'
})
export class ContactPage {
    public station: any;
    pps: any;
    public spaceID: any;
    public parkingspaces: any[];
    public loadingPopup: any;
    public loadingPopup2: any;
    public loaded: boolean = false;

    constructor(public navCtrl: NavController, public data: DataProvider, public events: Events, public Parkplatz: ParkplatzProvider,public loadingCtrl: LoadingController) {
        this.parkingspaces = new Array();
        this.station = this.data.aktStation;
        this.pps = this.data.pps;
        console.log("HOMEPAGE"+this.pps);
        if(this.station)
            this.gibID();
        events.subscribe('station:changed', (station) => {
                this.parkingspaces=new Array();
                console.log("STATION" + station.name);
                if (this.pps) {
                    this.station = station;
                    console.log('Hallo aus der if this.pps');
                   this.gibID();
                }

            });

    }
    pushPage(){
        /*this.navCtrl.push(PushPage, {
            thing1:this.parkingspaces
        })*/
        this.data.parkingspaces=this.parkingspaces;
        this.navCtrl.push(PushPage);
    }
    /*ionViewWillEnter(){
        this.loadParkplatz('spaces/pit');
    }*/
    openKarte() {
        this.navCtrl.parent.select(0);
    }

    public loadParkplatz(param) {
        this.Parkplatz.load(param).then(data => {

            this.pps = data['items'];
            console.log("Parkplätze ohne Belegungen");
            console.log(this.pps);
            this.loaded = true;
            if(this.station) {
                this.gibID();
            }
            this.loadingPopup.dismiss();
            return true;
        });
        return false;
    }
    gibID() {

            for (let pp of this.pps) {
                /* console.log("Parkplatz Station ID"+pp.station.id);*/
                if (this.station.number == pp.station.id) {
                    console.log(pp.title);
                    this.parkingspaces.push(pp);
                }
            }
            this.spaceID=this.parkingspaces.length;
        }


}
