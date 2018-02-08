import { Injectable } from '@angular/core';

@Injectable()
export class DataProvider {
  public aktStation: any;
  public pps:any;
  public parkingspaces;

  constructor() {
    console.log('Hello DataProvider Provider');
  }
}
