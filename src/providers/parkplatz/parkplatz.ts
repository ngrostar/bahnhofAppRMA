import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';
import {HttpHeaders} from "@angular/common/http"
import { HttpClient } from '@angular/common/http';


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

    getpp() {
        /*return new Promise(resolve => {
            const headers = new HttpHeaders().set('Authorization', `Bearer 61142190cdeab44f140c58c9fb40d293`);
            headers.append('Accept','application/json');
            this.http.get('https://api.deutschebahn.com/stada/v2/stations',{headers}).subscribe(data => {
                resolve(data);
            }, err => {
                console.log(err);
            });
        });*/
        const headers = new HttpHeaders().set('Authorization', `Bearer 61142190cdeab44f140c58c9fb40d293`);
        headers.append('Accept', 'application/json');
        var response = this.http.get('https://api.deutschebahn.com/stada/v2/stations', {headers}).subscribe(data => {
            console.log(data);
            return response;
        });
    }
}
