import {Component} from '@angular/core';
import {IonicPage, NavController, NavParams} from 'ionic-angular';
import {DataProvider} from '../../providers/data/data';

/**
 * Generated class for the SettingsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
    selector: 'page-settings',
    templateUrl: 'settings.html',
})
export class SettingsPage {
    public settings: any;

    constructor(public navCtrl: NavController, public navParams: NavParams, public data: DataProvider) {
        this.settings = this.data.settings;
    }

    ionViewWillEnter() {
        this.settings = this.data.settings;
    }
    
    reorderItems(indexes) {
        let element = this.settings[indexes.from];
        this.settings.splice(indexes.from, 1);
        this.settings.splice(indexes.to, 0, element);
    }
}
