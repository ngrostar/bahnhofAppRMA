import {Component} from '@angular/core';
import {IonicPage, NavController, NavParams} from 'ionic-angular';
import {DataProvider} from "../../providers/data/data";
import * as $ from 'jquery';

/**
 * Generated class for the PushPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
    selector: 'page-push',
    templateUrl: 'push.html',
})
export class PushPage {
    parkingspaces: any;
    tariffFlags: any;
    tariffInfo: any;

    constructor(public navCtrl: NavController, public navParams: NavParams, public data: DataProvider) {
        this.parkingspaces = this.data.parkingspaces;
        console.log(this.parkingspaces);
        // $('html,body').animate({scrollTop: $("#" + this.data.pid).offset().top}, 1000);
    }

    ionViewDidEnter() {
        // console.log("scrolle gerade", '#'+this.data.pid);
        // let element = document.getElementById(this.data.pid);
        // element.scrollIntoView();
    }

    ionViewWillLeave() {
        this.navCtrl.popToRoot();
    }
}
