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
    public stationParking: boolean = false;

    constructor(public navCtrl: NavController, public events: Events, public TC: TravelCenterProvider, public fasta: FastaProvider, public navParams: NavParams, public data: DataProvider) {
        this.station = this.data.aktStation;
        this.station.fasta = false;

        if (this.station) {
            this.loadStationParking();
            this.loadTC();
            this.loadFasta();
        }

        events.subscribe('station:changed', (station) => {
            console.log("Detailansicht empfängt: Bahnhof aktualisiert");
            this.station = station;
            this.loadStationParking();
        });
    }

    ionViewWillEnter() {
        this.station = this.data.aktStation;
        this.station.fasta = false;

        if(this.station) {
            this.loadStationParking();
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
        this.fasta.load(this.station.number).then((data) => {
            let fasta = data;
            this.station.fasta = fasta.facilities;
            if(this.station.fasta.length === 0) {
                this.station.fasta = false;
            }
            console.log("Fasta");
            console.log(this.station.fasta);
            this.data.aktStation = this.station;
            this.events.publish('station:changed', this.station);
            console.log(this.station);
            this.settleCss();
        },(reason) => {
            console.log("Fasta laden fehlgeschlagen: ", reason);
            this.settleCss();
        });
    }

    loadStationParking() {
        if(this.station){
            let pps = this.data.pps;
            for (let pp of pps) {
                if (this.station.number == pp.station.id) {
                    this.stationParking = true;
                    return;
                }
            }
        }
        this.stationParking = false;
    }

    openKarte() {
        this.navCtrl.parent.select(0);
    }

    openFasta() {
        this.navCtrl.push(FastaPage);
    }

    openParking() {
        this.navCtrl.parent.select(2);
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

        let $dropdown = $('#' + service + 'Dropdown');
        if (this.dropdowns[id] === true) {
            $dropdown.css('max-height', '1000px');
            $dropdown.css('display', 'block');
        } else {
            $dropdown.css('max-height', '0px'); // funktionier nicht. Warum?!
            $dropdown.css('display', 'none');
        }
    }

    settleCss() {
        if(this.stationParking || this.station.fasta) {
            $('.addressInner').css('top', '40%');
            $('div.bfoto').css('min-height', '15rem');
        } else {
            $('.addressInner').css('top', '50%');
            $('div.bfoto').css('min-height', '6rem');
        }

        if(this.station.fasta && !this.stationParking) {
            $('.fastaButton').addClass('singleButton');
        }
        if(!this.station.fasta && this.stationParking) {
            $('.parkingButton').addClass('singleButton');
        }
    }

}
