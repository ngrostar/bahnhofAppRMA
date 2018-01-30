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

    constructor(public navCtrl: NavController, public StadaProvider: StadaProvider) {
        // this.posts = new Array<Object>();
        this.loadpp('stations'); // stations/{id} oder szentralen/{id}
    }


    loadpp(param) {
        this.StadaProvider.getpp(param).then(data => {

          this.posts = data['result'];
          console.log("POOOOOOOOOOOSTS");
          console.log(this.posts);
        });

    }
}
