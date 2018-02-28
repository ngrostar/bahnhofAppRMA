import {Component, ElementRef, ViewChild} from '@angular/core';
import {AlertController, Events, IonicPage, NavController, NavParams} from 'ionic-angular';
import {DataProvider} from "../../providers/data/data";
import {Geolocation} from '@ionic-native/geolocation';  // https://ionicframework.com/docs/native/geolocation/
import 'rxjs/operator/map';
import { DatePipe } from '@angular/common';import { registerLocaleData } from '@angular/common';
import localeDE from '@angular/common/locales/de';

registerLocaleData(localeDE, 'de');
import * as $ from "jquery";

declare let google;

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
    public pp: any;

    @ViewChild('map') mapElement: ElementRef;
    map: any;
    public markers: any = [];

    constructor(public navCtrl: NavController, public geolocation: Geolocation, public navParams: NavParams, public alertCtrl: AlertController, public data: DataProvider, public events: Events) {
        this.station = this.data.aktStation;

        events.subscribe('station:changed', (station) => {
            this.station = station;
        });
    }

    ionViewDidLoad() {
        this.loadMap();
    }

    ionViewWillEnter() {
        this.pp = this.navParams.get('pp');
        this.station = this.data.aktStation;
        this.loadMap();
        if(this.navParams.get('ppView')) {
            this.addMarkerForParkplatz();
        } else if (this.station.fasta) {
            this.loadFastas();
        }
    }

    ionViewWillLeave() {
        this.navCtrl.popToRoot();
    }

    clearAktFasta() {
        this.aktFasta = null;
    }

    updatePosition(center = false) {
        if (center === true) { // direktes Zentrieren auf letzte Position bis neue geladen
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

        let mapOptions = {
            center: latLng,
            zoom: 17,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };

        this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);

        let markericon = {
            url: 'assets/imgs/locb.png',
            scaledSize: new google.maps.Size(30, 30)
        };

        this.locMarker = new google.maps.Marker({
            map: this.map,
            icon: markericon
        });

        this.timer = setInterval(() => {
            this.updatePosition()
        }, 1000);
    }

    addMarkerForParkplatz() {
        let latLng = new google.maps.LatLng(this.pp.geoLocation.latitude, this.pp.geoLocation.longitude);

        let markericon = {
            url: 'assets/imgs/parking.png',
            scaledSize: new google.maps.Size(40, 40)
        };

        new google.maps.Marker({
            map: this.map,
            position: latLng,
            icon: markericon
        });

        this.map.setCenter(latLng);
    }

    loadFastas() {
        console.log('fasta loading', this.station.fasta);
        for (let fasta of this.station.fasta) {
            fasta.running = (fasta.state == ('ACTIVE'));
            this.addSpecificMarker(fasta);
        }
    }

    addSpecificMarker(fasta) {
        let latLng = new google.maps.LatLng(fasta.geocoordY, fasta.geocoordX);

        let markericon = {
            url: 'assets/imgs/' + fasta.type.toLowerCase() + ((fasta.running) ? '1' : '0') + '.png',
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
    }

    toggleDetails(preset = null) {
        if (preset === null) {
            this.detailsHidden = !this.detailsHidden;
        } else {
            this.detailsHidden = !preset;
        }
        if (this.detailsHidden === true) {
            $('.detailBox').css('max-height', '0px');
            $('#fastaDetails').css('max-height', '28px');
        } else {
            $('.detailBox').css('max-height', '500px');
            $('#fastaDetails').css('max-height', '600px');
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
                        let desc;
                        if(this.aktFasta.type == 'ELEVATOR') desc = 'Aufzug ';
                        else if(this.aktFasta.type == 'ESCALATOR') desc = 'Rolltreppe ';
                        desc += this.aktFasta.description;

                        let datePipe = new DatePipe('de');
                        let currDate = datePipe.transform(new Date(), 'dd. MMMM y HH:mm');

                        let title = 'Vielen Dank für Ihre Nachricht';
                        let subtitle = 'Folgende Nachricht wurde gesendet:';
                        let message = currDate + ' Uhr<br>' + desc + '<br>' + input.comment;

                        if(input.comment === '') {
                            title = 'Keine Nachricht gesendet';
                            subtitle = '';
                            message = 'Fehlerbeschreibung nicht ausgefüllt';
                        }

                        let alert = this.alertCtrl.create({
                            title: title,
                            subTitle: subtitle,
                            message: message,
                            buttons: ['Schließen']
                        });
                        alert.present();
                    }
                }
            ]
        });
        alert.present();
    }
}
