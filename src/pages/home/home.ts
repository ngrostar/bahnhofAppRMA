import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import {StadaProvider} from "../../providers/stada/stada";
import 'rxjs/operator/map'

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})

export class HomePage {
    public posts: any = [];

    constructor(public navCtrl: NavController, public Stada: StadaProvider) {
        // this.posts = new Array<Object>();
        this.loadStada('stations'); // stations/{id} oder szentralen/{id}
    }

    loadStada(param) {
        this.Stada.load(param).then(data => {

          this.posts = data['result'];
          console.log("STATIONEN");
          console.log(this.posts);
        });

    }
}
