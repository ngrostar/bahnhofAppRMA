import {HttpClient, HttpHeaders} from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable()
export class TravelCenterProvider {

  constructor(public http: HttpClient) {
    console.log('Hello TravelCenterProvider Provider');
  }

  load(lat, long) {
    return new Promise(resolve => {
      const headers = new HttpHeaders().set('Authorization', `Bearer 61142190cdeab44f140c58c9fb40d293`);
      headers.append('Accept','application/json');
      let url = 'https://api.deutschebahn.com/reisezentren/v1/reisezentren/loc/' + lat + '/' + long + '/0.3';
      this.http.get(url,{headers}).subscribe(data => {
        resolve(data);
      }, err => {
        console.log(err);
      });
    });
  }

  loadb(param) {
    return new Promise(resolve => {
      const headers = new HttpHeaders().set('Authorization', `Bearer 61142190cdeab44f140c58c9fb40d293`);
      headers.append('Accept','application/json');
      let url = 'https://api.deutschebahn.com/reisezentren/v1/reisezentren/loc/' + param + '/0.3';
      this.http.get(url,{headers}).subscribe(data => {
        resolve(data);
      }, err => {
        console.log(err);
      });
    });
  }
}
