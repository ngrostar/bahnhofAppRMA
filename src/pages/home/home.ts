import {Component, ViewChild, ElementRef} from '@angular/core';
import {NavController, AlertController, Events, LoadingController} from 'ionic-angular';
import {StadaProvider} from "../../providers/stada/stada";
import {BfotosProvider} from "../../providers/bfotos/bfotos";
import {Geolocation} from '@ionic-native/geolocation';  // https://ionicframework.com/docs/native/geolocation/
import 'rxjs/operator/map';
import * as $ from 'jquery';
import {DataProvider} from "../../providers/data/data";
import {Contacts} from '@ionic-native/contacts';
import {ParkplatzProvider} from "../../providers/parkplatz/parkplatz";

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
    public loadedStada: boolean = false;
    public loadedPPs: boolean = false;
    public stations: any = [];
    public favorites: any = [];
    public contacts: any = [];
    public searchInput: any;
    public stationnames: any = []; // Array der Stationnamen, mit stations geht die Suche NICHT :( ecvtl station.name
    private geocoder = new google.maps.Geocoder();
    public detailsHidden: boolean = false;
    public locMarker: any;
    public timer: any;
    public loadingPopup: any;
    public pps: any;

    constructor(public navCtrl: NavController, public events: Events, public alertCtrl: AlertController, public loadingCtrl: LoadingController, public data: DataProvider, public geolocation: Geolocation, public Stada: StadaProvider, public Bfotos: BfotosProvider, public Parkplatz: ParkplatzProvider, public Contacts: Contacts) {
        this.loadStada('stations'); // mögl. Parameter: stations/{id} oder szentralen/{id})

        this.loadingPopup = this.loadingCtrl.create({
            spinner: 'dots',
            content: 'Stationsdaten werden geladen...'
        });

        this.loadingPopup.present();

        this.loadMap();

        this.loadParkplatz("spaces");

        if (localStorage.getItem('favoriteStations')) {
            this.favorites = (localStorage.getItem('favoriteStations')).split(',');
        }

        events.subscribe('station:changed', (station) => {
            this.aktStation = station;
        });
    }

    public loadParkplatz(param) {
        this.Parkplatz.load(param).then(data => {
            this.pps = data['items'];
            console.log('Parkplätze', this.pps);
            this.loadedPPs = true;
            if (this.loadedStada) {
                this.loadingPopup.dismiss();
            }
            this.data.pps = this.pps;
            return true;
        });
        return false;
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
            $('.detailBox img').css('max-height', '201px'); //unschöner Workaround

            // @Todo will iwie nicht
            console.log('max-height ' + Math.floor(window.innerHeight/3) + 'px');
            // $('.bfoto').css('max-height', Math.floor(window.innerHeight/3) + 'px');
        }
    }

    clearAktStation() {
        this.aktStation = null;
        this.updateAktStation();
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
            if (index !== -1) { // remove current station from favorites
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
            let alert = this.alertCtrl.create({
                title: 'Keine Favoriten',
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
            console.log('Stationen', this.stations);
            this.loadedStada = true;
            if (this.loadedPPs) {
                this.loadingPopup.dismiss();
            }
            this.loadAllFotos();
        });
    }

    loadAllFotos() {
        this.Bfotos.load('stations?hasPhoto=true').then((data) => {
            let fotos;
            fotos = data;

            for (let foto of fotos) { // add photo to all stations that have one
                let currStation = this.stations.find(station => station.number == foto.id);
                if (currStation) {
                    currStation.fotoURL = foto.photoUrl;
                }
            }
        });
        console.log('Loaded all photos');
    }

    loadMap() {
        $('.scroll-content').removeClass('overflowHidden');
        this.geolocation.getCurrentPosition().then((position) => {

            let latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

            let mapOptions = {
                mapTypeId: google.maps.MapTypeId.ROADMAP,
                mapTypeControl: false,
                zoomControl: true,
                zoomControlOptions: {
                    position: google.maps.ControlPosition.RIGHT_BOTTOM
                },
                streetViewControl: false,
                center: latLng,
                zoom: 14
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
            console.log('Fehler beim Laden der Map:', err);
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

    addSpecificMarker(station, center = false) {
        console.log("Adding marker for " + station.name);

        for (let eN of station.evaNumbers) {
            if (eN.isMain) {
                let coords = eN.geographicCoordinates.coordinates;
                let latLng = new google.maps.LatLng(coords[1], coords[0]);

                for (let marker of this.markers) { // remove duplicate markers
                    if (marker.getPosition().equals(latLng)) {
                        marker.setMap(null);
                    }
                }

                let marker = new google.maps.Marker({
                    map: this.map,
                    animation: google.maps.Animation.DROP,
                    position: latLng
                });

                this.markers.push(marker);

                if (center === true) {
                    this.map.setCenter(latLng);
                }

                google.maps.event.addListener(marker, 'click', (data) => {
                    this.toggleDetails(false);
                    this.aktStation = station;
                    this.updateAktStation();
                    this.toggleDetails(true);
                });
            }
        }

    }

    geocode(address) {
        // let formattedAddress = address.streetAddress + " " + address.postalCode + " " + address.locality;
        let formattedAddress = 'Albrechtstraße 30  Osnabrück';

        console.log('trying to get coords for ' + formattedAddress);
        this.geocoder.geocode({ 'address': formattedAddress }, (results, status) => {
            if (status == google.maps.GeocoderStatus.OK) {
                console.log('geocoding results ', results);

                return results[0];
            } else {
                console.log('Geocode for ' + formattedAddress + ' was not successful for the following reason: ' + status);
                return false;
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
            });
            this.findContacts(val); // auskommentiert, da sonst fehler: cordova.js wird nicht richtig eingebunden
        } else { // clear list
            this.stationnames = [];
            $('.scroll-content').addClass('overflowHidden');
        }
    }

    findNearby() {
        this.clearMarkers();
        let bounds = this.map.getBounds();
        let ne = bounds.getNorthEast(); // LatLng of the north-east corner
        let sw = bounds.getSouthWest();

        let nearbyStations = [];
        for (let station of this.stations) {
            for (let eN of station.evaNumbers) {
                if (eN.isMain) {
                    let coords = eN.geographicCoordinates.coordinates;

                    if (coords[1] < ne.lat() && coords[1] > sw.lat() &&
                        coords[0] < ne.lng() && coords[0] > sw.lng()) {
                        nearbyStations.push(station);
                    }
                }
            }
        }

        for (let nStation of nearbyStations) {
            this.addSpecificMarker(nStation);
        }

        if (nearbyStations.length === 0) {
            let alert = this.alertCtrl.create({
                title: 'Keine Stationen im aktuellen Bildausschnitt gefunden.',
                buttons: ['OK']
            });
            alert.present();
        }

        this.aktStation = null;
        this.updateAktStation();
    }

    foundStation(stationname) {
        this.cancelSearch();
        let aktStation = this.stations.find(station => station.name == stationname);
        console.log("aktStation ", aktStation);

        this.addSpecificMarker(aktStation, true);
        this.aktStation = aktStation;
        this.updateAktStation();


        this.toggleDetails(true);
        $('.filteredStations').hide();

        if (this.aktStation.fotoURL) { // detail window incl. Photo hides marker
            this.map.panBy(0, 140);   // => show marker in visible mapBounds
        }

        $('.scroll-content').addClass('overflowHidden');
    }

    findContacts(searchInput) {
        this.Contacts.find(['addresses', 'name'],
            { filter: searchInput, multiple: true, desiredFields: ['name', 'addresses']})
            .then((data) => {
                console.log("Contacts", data);
                this.contacts = data;
            });
    }

    foundContact(contact) {
        this.cancelSearch();
        let aktContact;
        aktContact = {
            name: contact.displayName,
            isContact: true
        };

        let atLeastOneAddressWorking: boolean = false;

        for (let address of contact.addresses) {
            let result;
            result = this.geocode(address);

            atLeastOneAddressWorking = atLeastOneAddressWorking || result;

            if (result) {
                aktContact.address = result.formatted_address.Replace(",","\n");
                let latLng = result.geometry.location;

                for (let marker of this.markers) { // remove duplicate markers
                    if (marker.getPosition().equals(latLng)) {
                        marker.setMap(null);
                    }
                }

                this.map.setCenter(latLng);

                let marker = new google.maps.Marker({
                    map: this.map,
                    animation: google.maps.Animation.DROP,
                    position: latLng
                });

                this.markers.push(marker);

                google.maps.event.addListener(marker, 'click', (data) => {
                    this.toggleDetails(false);
                    this.aktStation = aktContact;
                    this.updateAktStation();
                    this.toggleDetails(true);
                });
            }
        }
        if(atLeastOneAddressWorking) {
            this.aktStation = aktContact;
            this.updateAktStation();
            console.log("aktStation ist ein Contact", aktContact);

            this.toggleDetails(true);
            $('.filteredStations').hide();

            $('.scroll-content').addClass('overflowHidden');
        }
    }

    openDetails() {
        this.data.aktStation = this.aktStation;
        this.navCtrl.parent.select(1, { 'aktStation': this.aktStation });
    }

    updateAktStation() {
        this.events.publish('station:changed', this.aktStation);
        this.data.aktStation = this.aktStation;
    }

    clearMarkers() {
        for (let marker of this.markers) {
            marker.setMap(null);
        }
        this.markers = [];
    }
}