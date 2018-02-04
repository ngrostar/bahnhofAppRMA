import { Component, ViewChild, ElementRef } from '@angular/core';
import {NavController, NavParams, ModalController, Events} from 'ionic-angular';
import {StadaProvider} from "../../providers/stada/stada";
import { Geolocation } from '@ionic-native/geolocation';  // https://ionicframework.com/docs/native/geolocation/
import 'rxjs/operator/map';
import * as $ from 'jquery';

declare let google;

@Component({
  selector: 'home-page',
  templateUrl: 'home.html'
})
export class HomePage {

  @ViewChild('map') mapElement: ElementRef;
  map: any;
  public stations: any = [];
  public urstations:any=[]; //Mal testen, ob man das noch braucht
  public stationnames: any = []; // Array der Stationnamen, mit stations geht die Suche NICHT :( ecvtl station.name
  searchQuery: string = '';
  geocoder = new google.maps.Geocoder();

  constructor(public navCtrl: NavController, public events: Events, public modalCtrl: ModalController, public navParams: NavParams, public geolocation: Geolocation, public Stada: StadaProvider) {
    this.loadStada('stations'); // stations/{id} oder szentralen/{id})

    this.loadMap();
  }

  ionViewDidLoad() {
    // this.loadMap();
  }


  loadStada(param) {
    this.Stada.load(param).then(data => {

      this.stations = data['result'];
      this.urstations=data['result']; // Soll dazu dienen, um den Ursprung beim Suchen wiederherzustellen
      console.log("STATIONEN");
      console.log(this.stations);
      // let count = 0;
      for(let station of this.stations) {
        // if(count<100)
        // this.addSpecificMarker(station, false);
        // count++;
      }
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

      $('.scroll-content').addClass('overflowHidden');

    }, (err) => {
      console.log(err);
    });

  }

  addSpecificMarker(station, center) {
    console.log("Trying to add marker for " + station.name);

    for(let eN of station.evaNumbers) {
      if(eN.isMain) {
        let coords = eN.geographicCoordinates.coordinates;
        let latLng = new google.maps.LatLng(coords[1], coords[0]);

        let marker = new google.maps.Marker({
          map: this.map,
          color: '#00aaff',
          animation: google.maps.Animation.DROP,
          position: latLng
        });

        if(center == true) {
          this.map.setCenter(latLng);
        }

        let content = "<h6>" + station.name + "</h6><p>Länge: " +  coords[1] + "<br>Breite: " + coords[0] + "</p>";
      }
    }

  }
  //Brauchen wir das noch?
  geocode(station) {

    let address = station.mailingAddress.street + " " + station.mailingAddress.zipcode + " " + station.mailingAddress.city;
    console.log('trying to get coords for ' + address);
    this.geocoder.geocode({'address': address}, function (results, status) {
      if (status == google.maps.GeocoderStatus.OK) {

        let ll = new google.maps.LatLng(50,8);
        this.map.setCenter(ll);
        // console.log(results);
        // this.map.setCenter(results[0].geometry.location);
        // // let latLng = new google.maps.LatLng(results[0].geometry.viewport.b.b, results[0].geometry.viewport.f.b);
        // console.log(results[0].geometry.viewport.b.b, results[0].geometry.viewport.f.b, latLng);
        // // this.map.setCenter(latLng);
        // let marker = new google.maps.Marker({
        //   map: this.map,
        //   position: results[0].geometry.location,
        //   // position: latLng,
        //   animation: google.maps.Animation.DROP
        // });
      } else {
        console.log('Geocode for ' + station.name + ' was not successful for the following reason: ' + status);
      }
    });

  }
  initializeStations(){
    /*this.stations=this.urstations;*/
    this.stationnames = [];
    for(let station of this.stations){
          this.stationnames.push(station.name);
          // console.log('Zu stationnames ist' + station.name + 'hinzugefuegt worden. Array:' + this.stationnames);
      }
  }
  searchStation(ev:any){
      $('.filteredStations').show();


      // set val to the value of the searchbar
      let val = ev.target.value;

      // if the value is an empty string don't filter the items
      if (val && val.trim() != '') {
        $('.scroll-content').removeClass('overflowHidden');

        // Reset items back to all of the items
        this.initializeStations();
        this.stationnames = this.stationnames.filter((station) => {
              return (station.toLowerCase().indexOf(val.toLowerCase()) > -1);
          })
      } else { // clear list
        this.stationnames = [];
        $('.scroll-content').addClass('overflowHidden');
        console.log('overflow hidden now.')
      }
  }
    selectStation(stationn){
        console.log('Test der Suche:');
        console.log(stationn);
    }

    foundStation(stationname) {
      let aktStation = this.stations.find( station => station.name == stationname);
      console.log("aktStation ", aktStation);

      this.addSpecificMarker(aktStation, true);

      $('.filteredStations').hide();
    }
  }

