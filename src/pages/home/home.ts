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
  public posts: any = [];

  constructor(public navCtrl: NavController, public events: Events, public modalCtrl: ModalController, public navParams: NavParams, public geolocation: Geolocation, public Stada: StadaProvider) {
    this.loadStada('stations'); // stations/{id} oder szentralen/{id})
     this.loadMap();
  }

  ionViewDidLoad(){
    // this.loadMap();
  }



  loadStada(param) {
    this.Stada.load(param).then(data => {

      this.posts = data['result'];
      console.log("STATIONEN");
      console.log(this.posts);
    });

  }

  loadMap(){
    this.geolocation.getCurrentPosition().then((position) => {

      let latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

      let mapOptions = {
        center: latLng,
        zoom: 15,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      };

      this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);

    }, (err) => {
      console.log(err);
    });

  }
  // loadMap(){
  //
  //   let latLng = new google.maps.LatLng(-34.9290, 138.6010);
  //
  //   let mapOptions = {
  //     center: latLng,
  //     zoom: 15,
  //     mapTypeId: google.maps.MapTypeId.ROADMAP
  //   };
  //
  //   this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);
  //
  // }
}
