import {Component} from '@angular/core';
import {DataProvider} from "../../providers/data/data";
import {TravelCenterProvider} from "../../providers/travel-center/travel-center";
import {NavController, Events, NavParams} from 'ionic-angular';
import {FastaProvider} from "../../providers/fasta/fasta";
import * as $ from "jquery";
import {FastaPage} from "../fasta/fasta";

@Component({
    selector: 'page-about',
    templateUrl: 'about.html'
})
export class AboutPage {
    public station: any;
    public dropdowns: boolean[] = [false, false, false]; //@todo dropdowns ordnen
    public tc: any;

    constructor(public navCtrl: NavController, public events: Events, public TC: TravelCenterProvider, public fasta: FastaProvider, public navParams: NavParams, public data: DataProvider) {
        this.dropdowns[0] = false;
        this.dropdowns[1] = false;
        this.dropdowns[2] = false;

        this.station = data.aktStation;

        if (this.station) {
            this.loadTC();
            this.loadFasta();
        }

        events.subscribe('station:changed', (station) => {
            console.log("Detailansicht empfängt: Bahnhof aktualisiert");
            this.station = station;
        });
    }

    ionViewWillLoad() {
        if (this.station) {
            this.loadTC();
            this.loadFasta();
        }
    }

    loadTC() {
        for (let eN of this.station.evaNumbers) {
            if (eN.isMain) {
                let coords = eN.geographicCoordinates.coordinates;

                this.TC.load(coords[1], coords[0]).then(data => {
                    this.tc = data[0];
                    console.log("TravelCenter");
                    console.log(this.tc);
                });
            }
        }
    }

    loadFasta() {
        console.log('Fasta loading');
        this.fasta.load(this.station.number).then(data => {
            this.station.fasta = data;
            console.log("Fasta");
            console.log(this.station.fasta);
            this.data.aktStation = this.station;
            console.log(this.station);
            if(this.station.fasta) {
                $('div.bfoto').css('min-height', '15rem');
            }
            this.events.publish('station:changed', this.station);
        });
    }

    // @todo nach dem laden: falls parking XOR fasta: add class singleButton

    ionViewWillEnter() {
    }

    openKarte() {
        this.navCtrl.parent.select(0);
    }

    openFasta() {
        this.navCtrl.push(FastaPage);
    }

    toggleDropdown(service) {
        let id;
        if (service == 'parking') {
            id = 0;
        } else if (service == 'travelCenter') {
            id = 1;
        } else if (service == 'availability') {
            id = 2;
        } else return null;

        this.dropdowns[id] = !this.dropdowns[id];
        if (this.dropdowns[id] == true) {
            $('#' + service + 'Dropdown').css('max-height', '1000px');
            $('#' + service + 'Dropdown').css('display', 'block');
        } else {
            $('#' + service + 'Dropdown').css('max-height', '0px'); // funktionier nicht. Warum?!
            $('#' + service + 'Dropdown').css('display', 'none');
        }
    }

}
