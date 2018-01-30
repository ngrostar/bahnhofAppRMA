import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import {BfotosProvider} from "../../providers/bfotos/bfotos";

@Component({
  selector: 'page-about',
  templateUrl: 'about.html'
})
export class AboutPage {
  public foto: any;

  constructor(public navCtrl: NavController, public Bfotos: BfotosProvider) {
    this.loadBfotos('stations/2'); // stations/{id} oder szentralen/{id}
  }

  loadBfotos(param) {
    this.Bfotos.load(param).then(data => {

      this.foto = data["photoUrl"];
      console.log("FOTOOOS");
      console.log(this.foto);
    });

  }

}
