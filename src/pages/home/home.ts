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
import * as Fuse from 'fuse.js';

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
    public stationnames: any = [];
    private geocoder = new google.maps.Geocoder();
    public detailsHidden: boolean = false;
    public locMarker: any;
    public timer: any;
    public loadingPopup: any;
    public pps: any;
    public nearbyAllowed: boolean = true;

    public standardMarkericon = {
        url: 'assets/imgs/marker_rot.png',
        scaledSize: new google.maps.Size(27, 42)
    };
    public invertedMarkericon = {
        url: 'assets/imgs/marker_invertiert.png',
        scaledSize: new google.maps.Size(27, 42)
    };

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
            $('#stationDetails').css('max-height', '28px');
        } else {
            $('.detailBox').css('max-height', '500px');
            $('#stationDetails').css('max-height', '600px');
        }
    }

    clearAktStation() {
        this.updateAktStation(null);
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
            this.stationnames.push({ "name": name });
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

            this.map.addListener('zoom_changed', () => {
                // toggle nearby button
                let zoom = this.map.getZoom();
                console.log("Zoom", zoom);

                let $nearby = $('.nearby');

                if (zoom < 9) {
                    $nearby.css('background', 'grey');
                    $nearby.css('border', 'grey');
                    $nearby.css('cursor', 'default');
                    this.nearbyAllowed = false;
                } else {
                    $nearby.css('background', 'white');
                    $nearby.css('border', 'white');
                    $nearby.css('cursor', 'pointer');
                    this.nearbyAllowed = true;
                }
            });


            let markericon = {
                url: 'assets/imgs/locb.png',
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
                    position: latLng,
                    icon: this.standardMarkericon
                });

                if (station == this.aktStation) {
                    marker.setIcon(this.invertedMarkericon);
                }
                this.markers.push(marker);

                if (center === true) {
                    this.map.setCenter(latLng);
                }

                google.maps.event.addListener(marker, 'click', (data) => {
                    this.toggleDetails(false);
                    this.updateAktStation(station);
                    this.toggleDetails(true);
                });
            }
        }

    }

    geocode(address, callback) {
        let formattedAddress = "";
        if (address.streetAddress) formattedAddress += address.streetAddress + " ";
        if (address.postalCode) formattedAddress += address.postalCode + " ";
        if (address.locality) formattedAddress += address.locality;

        console.log('trying to get coords for ' + formattedAddress);
        this.geocoder.geocode({ 'address': formattedAddress }, (results, status) => {
            if (status == google.maps.GeocoderStatus.OK) {
                console.log('geocoding results ', results);
                callback(results[0]);
            } else {
                console.log('Geocode for ' + formattedAddress + ' was not successful for the following reason: ' + status);
            }
        });

    }

    initializeStations() {
        this.stationnames = [];
        for (let station of this.stations) {
            this.stationnames.push({ "name": station.name });
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
            let options = {
                shouldSort: true,
                threshold: 0.4,
                location: 0,
                distance: 100,
                maxPatternLength: 35,
                minMatchCharLength: 1,
                keys: [
                    "name"
                ]
            };
            let fuse = new Fuse(this.stationnames, options);
            this.stationnames = fuse.search(val);
            // this.stationnames = this.stationnames.filter((station) => {
            //     return (station.toLowerCase().indexOf(val.toLowerCase()) > -1);
            // });

            this.findContacts(val);
        } else { // clear list
            this.stationnames = [];
            $('.scroll-content').addClass('overflowHidden');
        }
    }

    findNearby(givenContact = false) {
        if (this.nearbyAllowed) {
            if (!givenContact) {
                this.clearMarkers();
            }
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
                let alert;
                if (givenContact) {
                    alert = this.alertCtrl.create({
                        title: 'Keine Stationen in der Nähe gefunden.',
                        message: 'Sie können jedoch den Kartenausschnitt vergrößern und mit "Stationen suchen" nach weiter entfernten Bahnhöfen suchen.',
                        buttons: ['OK']
                    });
                } else {
                    alert = this.alertCtrl.create({
                        title: 'Keine Stationen im aktuellen Bildausschnitt gefunden.',
                        buttons: ['OK']
                    });
                }
                alert.present();
            }

            this.toggleDetails(false);
        } else {
            console.log("Stationen in der Nähe suchen nicht erlaubt; Bildausschnitt zu groß");
        }
    }

    findNearContact() {
        if (this.aktStation.location) {
            this.map.setCenter(this.aktStation.location);
        }

        this.map.setZoom(12);

        this.findNearby(true);
    }

    foundStation(stationname) {
        this.cancelSearch();
        let aktStation = this.stations.find(station => station.name == stationname);
        console.log("aktStation ", aktStation);

        this.addSpecificMarker(aktStation, true);
        this.updateAktStation(aktStation);


        this.toggleDetails(true);
        $('.filteredStations').hide();

        if (this.aktStation.fotoURL) { // detail window incl. Photo hides marker
            this.map.panBy(0, 140);   // => show marker in visible mapBounds
        }

        $('.scroll-content').addClass('overflowHidden');
    }

    findContacts(searchInput) {
        this.Contacts.find(['addresses', 'name'],
            { filter: searchInput, multiple: true, desiredFields: ['name', 'displayName', 'addresses'] })
            .then((data) => {
                console.log("Contacts", data);
                this.contacts = data;
            });
    }

    foundContact(contact, address) {
        this.cancelSearch();
        let aktContact;

        aktContact = {
            name: contact.displayName,
            isContact: true
        };

        this.geocode(address, (result) => {
            console.log("result", result);

            if (result) {
                aktContact.address = result.formatted_address.replace(",", "\n");

                let latLng = result.geometry.location;
                console.log(aktContact.address, latLng);

                aktContact.location = latLng;

                for (let marker of this.markers) { // remove duplicate markers
                    if (marker.getPosition().equals(latLng)) {
                        marker.setMap(null);
                    }
                }

                this.map.setCenter(latLng);

                let marker = new google.maps.Marker({
                    map: this.map,
                    animation: google.maps.Animation.DROP,
                    position: latLng,
                    icon: this.standardMarkericon
                });

                this.markers.push(marker);

                google.maps.event.addListener(marker, 'click', (data) => {
                    this.toggleDetails(false);
                    this.updateAktStation(aktContact);
                    this.toggleDetails(true);
                });

                this.updateAktStation(aktContact);
                console.log("aktStation ist ein Contact", aktContact);

                this.toggleDetails(true);
                $('.filteredStations').hide();

                $('.scroll-content').addClass('overflowHidden');
            }
        });
    }

    openDetails() {
        this.data.aktStation = this.aktStation;
        this.navCtrl.parent.select(1, { 'aktStation': this.aktStation });

    }

    updateAktStation(newStation) {
        let oldStation = this.aktStation;
        this.aktStation = newStation;
        this.events.publish('station:changed', this.aktStation);
        this.data.aktStation = this.aktStation;

        let oldLatLng, newLatLng;
        if (oldStation) {
            if (oldStation.isContact) {
                oldLatLng = oldStation.location;
            } else {
                for (let eN of oldStation.evaNumbers) {
                    if (eN.isMain) {
                        let coords = eN.geographicCoordinates.coordinates;
                        oldLatLng = new google.maps.LatLng(coords[1], coords[0]);
                    }
                }

            }
        }
        if (newStation) {
            if (newStation.isContact) {
                newLatLng = newStation.location;
            } else {
                for (let eN of newStation.evaNumbers) {
                    if (eN.isMain) {
                        let coords = eN.geographicCoordinates.coordinates;
                        newLatLng = new google.maps.LatLng(coords[1], coords[0]);
                    }
                }
            }
        }
        for (let marker of this.markers) { // remove duplicate markers
            if (marker.getPosition().equals(oldLatLng)) {
                marker.setIcon(this.standardMarkericon);
            }
            if (marker.getPosition().equals(newLatLng)) {
                marker.setIcon(this.invertedMarkericon);
            }
        }
    }

    clearMarkers() {
        for (let marker of this.markers) {
            marker.setMap(null);
        }
        this.markers = [];
    }
}