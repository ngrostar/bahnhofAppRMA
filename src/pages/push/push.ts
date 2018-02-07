import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

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
  tariffFlags:any;
  tariffInfo:any;
  constructor(public navCtrl: NavController, public navParams: NavParams) {
    this.tariffFlags=this.navParams.get('thing1');
    console.log("HIER DIE PUSH PAGE!!");
    console.log(this.tariffFlags);
    this.tariffInfo=this.navParams.get('thing2');
    console.log(this.tariffInfo);
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad PushPage');
  }

}
