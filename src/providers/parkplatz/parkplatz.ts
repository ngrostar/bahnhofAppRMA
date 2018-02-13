import {HttpClient, HttpHeaders} from '@angular/common/http';
import { Injectable } from '@angular/core';



/*
  Generated class for the ParkplatzProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class ParkplatzProvider {

  constructor(public http: HttpClient) {
    console.log('Hello ParkplatzProvider Provider');
  }
    load(param) {
        return new Promise(resolve => {
            const headers = new HttpHeaders().set('Authorization', `Bearer 61142190cdeab44f140c58c9fb40d293`);
            headers.append('Accept','application/json');
            let url = 'https://api.deutschebahn.com/bahnpark/v1/' + param;
            this.http.get(url,{headers}).subscribe(data => {
                resolve(data);
            }, err => {
                console.log(err);
                this.http.get('data/DBRNI-Uebersicht_Bahnhoefe-Stand2016-01.csv').subscribe(data=>{
                    resolve(data);
                }, err=>{
                    console.log(err);
                    return 0;
                })
            });
        });
    }
}
