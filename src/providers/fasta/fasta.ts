import {HttpClient, HttpHeaders} from '@angular/common/http';
import { Injectable } from '@angular/core';

/*
  Generated class for the FastaProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class FastaProvider {

  constructor(public http: HttpClient) {
    console.log('Hello FastaProvider Provider');
  }

  load(param) {
    return new Promise(resolve => {
      const headers = new HttpHeaders().set('Authorization', `Bearer 61142190cdeab44f140c58c9fb40d293`);
      headers.append('Accept','application/json');
      let url = 'https://api.deutschebahn.com/fasta/v2/stations/' + param;
      this.http.get(url,{headers}).subscribe(data => {
        resolve(data);
      }, err => {
        console.log(err);
      });
    });
  }

}