import { Injectable } from '@angular/core';

@Injectable()
export class DataProvider {
  public aktStation: any;

  constructor() {
    console.log('Hello DataProvider Provider');
  }
}
