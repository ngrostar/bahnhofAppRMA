import {Component, ViewChild, ElementRef} from '@angular/core';
import {NavController, NavParams, AlertController, Events} from 'ionic-angular';
import {StadaProvider} from "../../providers/stada/stada";
import {BfotosProvider} from "../../providers/bfotos/bfotos";
import {Geolocation} from '@ionic-native/geolocation';  // https://ionicframework.com/docs/native/geolocation/
import 'rxjs/operator/map';
import * as $ from 'jquery';
import {DataProvider} from "../../providers/data/data";

declare let google;

@Component({
    selector: 'home-page',
    templateUrl: 'home.html'
})
export class HomePage {

    @ViewChild('map') mapElement: ElementRef;
    map: any;
    public aktStation: any = null;
    public markers: any = [];
    public stations: any = [];
    public favorites: any = [];
    public searchInput: any;
    public stationnames: any = []; // Array der Stationnamen, mit stations geht die Suche NICHT :( ecvtl station.name
    private geocoder = new google.maps.Geocoder();
    public detailsHidden: boolean = false;
    public locMarker: any;
    public timer;

    constructor(public navCtrl: NavController, public events: Events, private alertCtrl: AlertController, public navParams: NavParams, public data: DataProvider, public geolocation: Geolocation, public Stada: StadaProvider, public Bfotos: BfotosProvider) {
        this.loadStada('stations'); // stations/{id} oder szentralen/{id})

        this.loadMap();

        if (localStorage.getItem('favoriteStations')) {
            this.favorites = (localStorage.getItem('favoriteStations')).split(',');
        }
    }

    toggleDetails(preset = null) {
        if (preset === null) {
            this.detailsHidden = !this.detailsHidden;
        } else {
            this.detailsHidden = !preset;
        }
        if (this.detailsHidden === true) {
            $('.detailBox').css('max-height', '0px');
            $('#stationDetails').css('max-height', '28px'); //unschöner Workaround
        } else {
            $('.detailBox').css('max-height', '500px');
            $('#stationDetails').css('max-height', '600px'); //unschöner Workaround
        }
    }

    clearAktStation() {
        this.aktStation = null;
        // this.events.publish('station:changed', this.aktStation);
        this.data.aktStation = this.aktStation;
    }

    ionViewDidLoad() {
        // this.loadMap();
    }

    isAktFavorite(): boolean {
        return this.aktStation && this.favorites.find(name => name == this.aktStation.name);
    }

    isFavorite(searchName): boolean {
        return this.favorites.find(name => name == searchName);
    }

    toggleFavorite() {
        if (this.isAktFavorite()) {
            const index: number = this.favorites.indexOf(this.aktStation.name);
            if (index !== -1) {
                this.favorites.splice(index, 1);
            }
            localStorage.setItem('favoriteStations', this.favorites);
        } else {
            this.favorites.push(this.aktStation.name);
            localStorage.setItem('favoriteStations', this.favorites);
        }
    }

    showFavorites() {
        this.stationnames = [];
        for (let name of this.favorites) {
            this.stationnames.push(name);
        }

        if (this.favorites.length === 0) {
            // alert("Keine Favoriten");
            let alert = this.alertCtrl.create({
                title: 'Keine Favoriten',
                subTitle: '<ion-icon name="heart-outline"></ion-icon>',
                buttons: ['OK']
            });
            alert.present();
        } else {
            $('.filteredStations').show();
            $('ion-searchbar').css('width', '75%');
            $('ion-searchbar').css('float', 'left');
            $('.cancelSearch').show();
            $('.scroll-content').removeClass('overflowHidden');
        }

        console.log(this.stationnames);
    }

    cancelSearch() {
        $('.filteredStations').hide();

        $('.scroll-content').addClass('overflowHidden');

        this.stationnames = [];

        $('ion-searchbar').css('width', '100%');
        $('.cancelSearch').hide();
    }

    loadStada(param) {
        this.Stada.load(param).then(data => {
            this.stations = data['result'];
            console.log("STATIONEN");
            console.log(this.stations);
        });
    }

    loadMap() {
        this.geolocation.getCurrentPosition().then((position) => {

            let latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

            let mapOptions = {
                center: latLng,
                zoom: 14,
                mapTypeId: google.maps.MapTypeId.ROADMAP
            };

            this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);

            this.map.setCenter(latLng);

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

            $('.scroll-content').addClass('overflowHidden');

        }, (err) => {
            console.log(err);
        });
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

    addSpecificMarker(station, center) {
        console.log("Trying to add marker for " + station.name);

        for (let eN of station.evaNumbers) {
            if (eN.isMain) {
                let coords = eN.geographicCoordinates.coordinates;
                let latLng = new google.maps.LatLng(coords[1], coords[0]);

                let marker = new google.maps.Marker({
                    map: this.map,
                    animation: google.maps.Animation.DROP,
                    position: latLng
                });

                this.markers.push(marker);

                if (center == true) {
                    this.map.setCenter(latLng);
                }

                this.addContentWindow(station, marker);
            }
        }

    }

    //Brauchen wir das noch?
    geocode(station) {

        let address = station.mailingAddress.street + " " + station.mailingAddress.zipcode + " " + station.mailingAddress.city;
        console.log('trying to get coords for ' + address);
        this.geocoder.geocode({ 'address': address }, function (results, status) {
            if (status == google.maps.GeocoderStatus.OK) {

                let ll = new google.maps.LatLng(50, 8);
                this.map.setCenter(ll);
            } else {
                console.log('Geocode for ' + station.name + ' was not successful for the following reason: ' + status);
            }
        });

    }

    initializeStations() {
        this.stationnames = [];
        for (let station of this.stations) {
            this.stationnames.push(station.name);
        }
    }

    searchStation(ev: any) {
        $('.filteredStations').show();

        // set val to the value of the searchbar
        let val = ev.target.value;

        // if the value is an empty string don't filter the items
        if (val && val.trim() !== '') {
            $('.scroll-content').removeClass('overflowHidden');

            // Reset items back to all of the items
            this.initializeStations();
            this.stationnames = this.stationnames.filter((station) => {
                return (station.toLowerCase().indexOf(val.toLowerCase()) > -1);
            })
        } else { // clear list
            this.stationnames = [];
            $('.scroll-content').addClass('overflowHidden');
        }
    }

    foundStation(stationname) {
        this.cancelSearch();
        let aktStation = this.stations.find(station => station.name == stationname);
        console.log("aktStation ", aktStation);

        this.addSpecificMarker(aktStation, true);

        this.toggleDetails(true);
        $('.filteredStations').hide();

        $('.scroll-content').addClass('overflowHidden');
    }

    addContentWindow(station, marker) {
        this.Bfotos.load('stations/' + station.number).then(data => {
            console.log(data["photoUrl"]);

            let fotoURL = data["photoUrl"];
            this.aktStation = station;
            this.aktStation.fotoURL = fotoURL;
            this.events.publish('station:changed', this.aktStation);
            this.data.aktStation = this.aktStation;

            console.log('fotoURL', fotoURL);
            let content = '<h6>' + station.name + '</h6>';

            if (fotoURL !== null) {
                content += '<img src="' + fotoURL + '" class="bfoto"/>';
            }

            content += '<button ion-button color="secondary"><ion-icon name="heart"></ion-icon>Favoriten</button>';
            content += '<button ion-button><ion-icon name="arrow-forward"></ion-icon>Details</button>';

            // let infoWindow = new google.maps.InfoWindow({content: content});

            google.maps.event.addListener(marker, 'click', (data) => {
                this.toggleDetails(false);
                this.aktStation = station;
                this.aktStation.fotoURL = fotoURL;
                this.data.aktStation = this.aktStation;
                this.events.publish('station:changed', this.aktStation);
                this.toggleDetails(true);

                // infoWindow.open(this.map, marker);
                // if(this.lastInfoWindow && this.lastInfoWindow != infoWindow) {
                //   this.lastInfoWindow.close();
                // }
                // this.lastInfoWindow = infoWindow;
            });

        });
    }

    openDetails() {
        this.data.aktStation = this.aktStation;
        this.navCtrl.parent.select(1, { 'aktStation': this.aktStation });
    }
}

