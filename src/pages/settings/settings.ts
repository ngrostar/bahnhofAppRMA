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
        if(!this.settings[0].name) {
            this.settings = this.data.settingsBackup;
            this.data.settings = this.data.settingsBackup;
            let settingsString = "";
            for(let s of this.settings) {
                settingsString += JSON.stringify(s) + "#";
            }
            localStorage.setItem('settings', settingsString);
            console.log('Settings aus Backup wiederhergestellt');
        }
    }
    
    reorderItems(indexes) {
        let element = this.settings[indexes.from];
        this.settings.splice(indexes.from, 1);
        this.settings.splice(indexes.to, 0, element);

        let settingsString = "";
        for(let s of this.settings) {
            settingsString += JSON.stringify(s) + "#";
        }
        localStorage.setItem('settings', settingsString);
    }

    switch(k) {
        console.log("switch", k);
        for(let s of this.settings) {
            if(s.key == k) {
                s.show = !s.show;
            }
        }

        let settingsString = "";
        for(let s of this.settings) {
            settingsString += JSON.stringify(s) + "#";
        }
        localStorage.setItem('settings', settingsString);
    }
}
