import {Component} from '@angular/core';
import {ParkplatzProvider} from "../../providers/parkplatz/parkplatz";
import {Events, NavController} from 'ionic-angular';
import {DataProvider} from "../../providers/data/data";
import {PushPage} from "../push/push";
import {LoadingController} from "ionic-angular";
import {delay} from "rxjs/operator/delay";

@Component({
    selector: 'page-contact',
    templateUrl: 'contact.html'
})
export class ContactPage {
    public station: any;
    pps: any;
    public spaceID: any;
    public parkplatz: any;
    public loadingPopup: any;
    public loadingPopup2: any;
    public loaded: boolean = false;

    constructor(public navCtrl: NavController, public data: DataProvider, public events: Events, public Parkplatz: ParkplatzProvider,public loadingCtrl: LoadingController) {
        /*this.loadingPopup = this.loadingCtrl.create({
            spinner: 'dots',
            // content: '<div class="custom-spinner-container"><div class="custom-spinner-box"></div></div>'
            content: 'Parkplatzdaten werden geladen...'
        });

        this.loadingPopup.present();
        this.loadParkplatz('spaces/pit');*/

        this.station = this.data.aktStation;

            this.loadingPopup = this.loadingCtrl.create({
                spinner: 'dots',
                // content: '<div class="custom-spinner-container"><div class="custom-spinner-box"></div></div>'
                content: 'Parkplatzdaten werden geladen...'
            });

            this.loadingPopup.present();
            if(this.loadParkplatz('spaces/pit')&&this.station)
                    this.parkplatz=this.gibID();


                /*this.spaceID = this.gibID();
                console.log(this.spaceID);
                if (this.spaceID != 0) {
                    this.loadingPopup2 = this.loadingCtrl.create({
                        spinner: 'dots',
                        // content: '<div class="custom-spinner-container"><div class="custom-spinner-box"></div></div>'
                        content: 'Spezifische Parkplatzdaten werden geladen...'
                    });

                    this.loadingPopup2.present();
                    this.loadParkplatz2('spaces/' + this.spaceID); //Daten des einzelnen Parkplatzes holen
                }*/


            events.subscribe('station:changed', (station) => {
                if (this.pps) {
                    this.station = station;
                    this.parkplatz=this.gibID();
                }
            });

    }
  /*  checkFlag(){
        if(!this.pps) {
            window.setTimeout(this.checkFlag(), 100); /!* this checks the flag every 100 milliseconds*!/
        } else {
            this.spaceID = this.gibID();
            console.log(this.spaceID);
            if (this.spaceID != 0) {
                this.loadingPopup2 = this.loadingCtrl.create({
                    spinner: 'dots',
                    // content: '<div class="custom-spinner-container"><div class="custom-spinner-box"></div></div>'
                    content: 'Spezifische Parkplatzdaten werden geladen...'
                });

                this.loadingPopup2.present();
                this.loadParkplatz2('spaces/' + this.spaceID); //Daten des einzelnen Parkplatzes holen
            }
        }
    }*/
    /*ionViewWillEnter(){
        console.log("Hallo aus IonViewWillLoad");
        this.loadingPopup = this.loadingCtrl.create({
            spinner: 'dots',
            // content: '<div class="custom-spinner-container"><div class="custom-spinner-box"></div></div>'
            content: 'Parkplatzdaten werden geladen...'
        });

        this.loadingPopup.present();
        this.loadParkplatz('spaces/pit');

    }*/
    pushPage(){
        this.navCtrl.push(PushPage, {
            thing1:this.parkplatz.tariffFlags,
            thing2: this.parkplatz.tariffInfo
        })
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
                this.parkplatz = this.gibID();
            }
            this.loadingPopup.dismiss();
            return true;
        });
        return false;
    }

   /* loadParkplatz2(param) {
        this.Parkplatz.load(param).then(data => {

            this.parkplatz = data;
            console.log("Einzelner Parkplatz");
            console.log(this.parkplatz);
            this.loadingPopup2.dismiss();
        });
    }*/

    gibID() {

            for (let pp of this.pps) {
                if (this.station.number == pp.station.id) {
                    console.log(pp.title);
                    return pp;
                }
            }
            this.spaceID=0;
        }


}
