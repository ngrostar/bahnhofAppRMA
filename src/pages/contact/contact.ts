import {Component} from '@angular/core';
import {ParkplatzProvider} from "../../providers/parkplatz/parkplatz";
import {Events, NavController} from 'ionic-angular';
import {DataProvider} from "../../providers/data/data";
import {PushPage} from "../push/push";
import {LoadingController} from "ionic-angular";
import { InAppBrowser } from '@ionic-native/in-app-browser';
import {FastaPage} from '../fasta/fasta';
import {DatePipe} from '@angular/common';

@Component({
    selector: 'page-contact',
    templateUrl: 'contact.html'
})
export class ContactPage {
    public station: any;
    pps: any;
    public numberOfParkingSpaces: any;
    public parkingspaces: any = [];
    public loaded: boolean = false;

    constructor(public navCtrl: NavController, public data: DataProvider, public events: Events, public Parkplatz: ParkplatzProvider, public loadingCtrl: LoadingController, public iab:InAppBrowser) {
        this.station = this.data.aktStation;
        this.pps = this.data.pps;
        console.log("Parkplätze ", this.pps);
        if (this.station) this.loadStationParking();

        events.subscribe('station:changed', (station) => {
            this.parkingspaces = [];
            this.station = station;
            if (this.pps && this.station) {
                this.loadStationParking();
            }
        });
    }
    openIAB(){
        this.iab.create(this.parkingspaces.operatorURL);
    }
    pushPage() {
        this.data.parkingspaces = this.parkingspaces;
        this.navCtrl.push(PushPage);
    }

    openKarte() {
        this.navCtrl.parent.select(0);
    }

    openLink(url) {
        console.log(url);
        // window.open(url, '_blank', 'location=yes');
        this.iab.create('http://' + url);
    }

    showInMaps(pp) {
        let data = {'pp': pp, 'ppView': true};
        this.navCtrl.push(FastaPage, data);
    }

    loadStationParking() {
        for (let pp of this.pps) {
            if (this.station.number == pp.station.id) {
                console.log(pp.title);
                this.parkingspaces.push(pp);
            }
        }
        this.numberOfParkingSpaces = this.parkingspaces.length;

        // check for occupancies of station's parkingspaces
        for(let pp of this.parkingspaces) {
            this.Parkplatz.load('spaces/' + pp.id + '/occupancies').then(data => {
                let detailedPP;
                detailedPP = data;
                pp.capacity = detailedPP.allocation.capacity;
                pp.timestamp = detailedPP.allocation.timestamp;


                let datePipe = new DatePipe('de');
                pp.timestamp = 'Stand: ';
                pp.timestamp += datePipe.transform(new Date(detailedPP.allocation.timestamp), 'dd. MMMM y HH:mm');
                pp.timestamp += ' Uhr';
            });
        }
    }
}
