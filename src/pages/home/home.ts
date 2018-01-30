import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import {ParkplatzProvider} from "../../providers/parkplatz/parkplatz";

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})

export class HomePage {
    public posts: any= [];

    constructor(public navCtrl: NavController, public ParkplatzProvider: ParkplatzProvider) {
        this.posts=new Array<Object>();
        this.loadpp();
    }


    loadpp() {
        this.ParkplatzProvider.getpp()
            .then(data => {
                this.posts = data;
                console.log(this.posts);
            });
    }
}