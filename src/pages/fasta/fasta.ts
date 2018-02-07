import {Component, ElementRef, ViewChild} from '@angular/core';
import {AlertController, Events, IonicPage, NavController} from 'ionic-angular';
import {DataProvider} from "../../providers/data/data";
import {Geolocation} from '@ionic-native/geolocation';  // https://ionicframework.com/docs/native/geolocation/
import 'rxjs/operator/map';
import * as $ from "jquery";

declare let google;

/**
 * Generated class for the FastaPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
    selector: 'page-fasta',
    templateUrl: 'fasta.html',
})

export class FastaPage {
    public station: any;
    public aktFasta;
    public detailsHidden: boolean = false;
    public locMarker: any;
    public timer: any;

    @ViewChild('map') mapElement: ElementRef;
    map: any;
    public markers: any = [];

    constructor(public navCtrl: NavController, public geolocation: Geolocation, public alertCtrl: AlertController, public data: DataProvider, public events: Events) {
        this.station = this.data.aktStation;

        events.subscribe('station:changed', (station) => {
            console.log("Detailansicht: Bahnhof aktualisiert");
            this.station = station;
        });
    }

    ionViewDidLoad() {
        this.loadMap();
        this.loadFastas();
    }

    ionViewWillEnter() {
        this.station = this.data.aktStation;
    }

    clearAktFasta() {
        this.aktFasta = null;
    }

    updatePosition(center = false) {
        if (center === true) {
            this.map.setCenter(this.locMarker.getPosition());
        }

        this.geolocation.getCurrentPosition().then((position) => {

            let latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

            this.locMarker.setPosition(latLng);

            if (center === true) {
                this.map.setCenter(latLng);
            }
        });
    }

    loadMap() {
        let coords = [];
        let latLng = null;
        for (let eN of this.station.evaNumbers) {
            if (eN.isMain) {
                coords = eN.geographicCoordinates.coordinates;
                latLng = new google.maps.LatLng(coords[1], coords[0]);
            }
        }

        if (latLng === null) {
            // Koordinaten ersetzen
        }

        let mapOptions = {
            center: latLng,
            zoom: 17,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };

        this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);

        let markericon = {
            url: '../../assets/imgs/locb.png',
            scaledSize: new google.maps.Size(30, 30)
        };

        this.locMarker = new google.maps.Marker({
            map: this.map,
            position: latLng,
            icon: markericon
        });

        this.timer = setInterval(() => {
            this.updatePosition()
        }, 1000);
    }

    loadFastas() {
        console.log('fasta loading', this.station.fasta.facilities);
        for (let fasta of this.station.fasta.facilities) {
            fasta.working = (fasta.state == ('ACTIVE'));
            this.addSpecificMarker(fasta);
        }
    }

    addSpecificMarker(fasta) {
        let latLng = new google.maps.LatLng(fasta.geocoordY, fasta.geocoordX);

        let markericon = {
            url: '../../assets/imgs/' + fasta.type.toLowerCase() + ((fasta.working) ? '1' : '0') + '.png',
            scaledSize: new google.maps.Size(30, 30)
        };

        let marker = new google.maps.Marker({
            map: this.map,
            position: latLng,
            icon: markericon
        });

        google.maps.event.addListener(marker, 'click', (data) => {
            this.toggleDetails(false);
            this.aktFasta = fasta;
            this.toggleDetails(true);
        });

        this.markers.push(marker);
        console.log(marker);

    }

    toggleDetails(preset = null) {
        if (preset === null) {
            this.detailsHidden = !this.detailsHidden;
        } else {
            this.detailsHidden = !preset;
        }
        if (this.detailsHidden === true) {
            $('.detailBox').css('max-height', '0px');
            $('#fastaDetails').css('max-height', '28px'); //unschöner Workaround
        } else {
            $('.detailBox').css('max-height', '500px');
            $('#fastaDetails').css('max-height', '600px'); //unschöner Workaround
        }
    }

    promptAlert() {
        let alert = this.alertCtrl.create({
            title: 'Fehler melden',
            inputs: [
                {
                    name: 'comment',
                    placeholder: 'Fehlerbeschreibung',
                }
            ],
            buttons: [
                {
                    text: 'Abbrechen',
                    role: 'cancel'
                },
                {
                    text: 'Senden',
                    handler: (input) => {
                        console.log(new Date(), input, this.aktFasta.description);
                        let desc;
                        desc += (this.aktFasta.type == 'ELEVATOR') ? 'Aufzug ' : '';
                        desc += (this.aktFasta.type == 'ESCALATOR') ? 'Rolltreppe ' : '';
                        desc += this.aktFasta.description;

                        let currTime = new Date().toISOString();

                        let alert = this.alertCtrl.create({
                            title: 'Vielen Dank für Ihre Nachricht',
                            subTitle: 'Folgende Nachricht wurde gesendet:',
                            message: '<ion-datetime displayFormat="DD. MMM YYYY HH:mm" [(ngModel)]="currTime"></ion-datetime><br>' +
                            desc + '<br>' + input.comment,
                            buttons: ['OK']
                        });
                        alert.present();
                    }
                }
            ]
        });
        alert.present();
    }
}
