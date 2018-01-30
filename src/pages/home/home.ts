import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import {ParkplatzProvider} from "../../providers/parkplatz/parkplatz";
import 'rxjs/operator/map'

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})

export class HomePage {
    public posts: any = [];

    constructor(public navCtrl: NavController, public ParkplatzProvider: ParkplatzProvider) {
        this.posts = new Array<Object>();
        this.loadpp();
    }


    loadpp() {
        this.posts=this.ParkplatzProvider.getpp();
        this.posts=this.posts.map(posts=>posts.name);
    }
}