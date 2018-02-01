import { Component, ViewChild, ElementRef } from '@angular/core';
import {NavController, NavParams, ModalController, Events} from 'ionic-angular';
import {StadaProvider} from "../../providers/stada/stada";
import { Geolocation } from '@ionic-native/geolocation';  // https://ionicframework.com/docs/native/geolocation/
import 'rxjs/operator/map';

declare let google;

@Component({
  selector: 'home-page',
  templateUrl: 'home.html'
})
export class HomePage {

  @ViewChild('map') mapElement: ElementRef;
  map: any;
  public stations: any = [];
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
      console.log("STATIONEN");
      console.log(this.stations);
      let ll = new google.maps.LatLng(50,8);
      this.map.setCenter(ll);
      // this.geocode(this.stations[1]);
    });

  }

  loadMap() {
    this.geolocation.getCurrentPosition().then((position) => {

      let latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

      let mapOptions = {
        center: latLng,
        zoom: 15,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      };

      this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);

      // this.map.setCenter(latLng);


    }, (err) => {
      console.log(err);
    });

  }

  addSpecificMarker(post) {
    console.log("Trying to add marker for " + post.name);

    let latLng = new google.maps.LatLng(post.breite, post.laenge);
    this.map.setCenter(latLng);

    let marker = new google.maps.Marker({
      map: this.map,
      color: '#00aaff',
      animation: google.maps.Animation.DROP,
      position: latLng
    });

    let content = "<h6>" + post.name + "</h6><p>Länge: " + post.laenge + "<br>Breite: " + post.breite + "</p>";

  }

  geocode(station) {
    let address = station.mailingAddress.street + " " + station.mailingAddress.zipcode + " " + station.mailingAddress.city;
    console.log('trying to get coords for ' + address);
    this.geocoder.geocode({'address': address}, function (results, status) {
      if (status == google.maps.GeocoderStatus.OK) {

        console.log(results);
        this.map.setCenter(results[0].geometry.location);
        // let latLng = new google.maps.LatLng(results[0].geometry.viewport.b.b, results[0].geometry.viewport.f.b);
        console.log(results[0].geometry.viewport.b.b, results[0].geometry.viewport.f.b, latLng);
        // this.map.setCenter(latLng);
        let marker = new google.maps.Marker({
          map: this.map,
          position: results[0].geometry.location,
          // position: latLng,
          animation: google.maps.Animation.DROP
        });
      } else {
        console.log('Geocode for ' + station.name + ' was not successful for the following reason: ' + status);
      }
    });

  }
}
