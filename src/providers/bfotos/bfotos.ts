import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';
import {HttpHeaders} from "@angular/common/http"
import { HttpClient } from '@angular/common/http';

@Injectable()
export class BfotosProvider {

  constructor(public http: HttpClient) {
    console.log('Hello BfotosProvider Provider');
  }


  load(param) {
    return new Promise(resolve => {
      const headers = new HttpHeaders().set('Authorization', `Bearer 61142190cdeab44f140c58c9fb40d293`);
      headers.append('Accept','application/json');
      let url = 'https://api.deutschebahn.com/bahnhofsfotos/v1/de/' + param;
      this.http.get(url,{headers}).subscribe(data => {
        resolve(data);
      }, err => {
        console.log(err);
      });
    });
  }

}
