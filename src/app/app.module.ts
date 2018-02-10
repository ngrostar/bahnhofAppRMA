import { NgModule, ErrorHandler } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { MyApp } from './app.component';
import { InAppBrowser } from '@ionic-native/in-app-browser';

import { AboutPage } from '../pages/about/about';
import { ContactPage } from '../pages/contact/contact';
import { HomePage } from '../pages/home/home';
import { TabsPage } from '../pages/tabs/tabs';
import { FastaPage } from "../pages/fasta/fasta";

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StadaProvider } from '../providers/stada/stada';
import { BfotosProvider } from '../providers/bfotos/bfotos';
import { HttpClientModule } from '@angular/common/http';
import { Geolocation } from '@ionic-native/geolocation';
import { DataProvider } from '../providers/data/data';
import { TravelCenterProvider } from '../providers/travel-center/travel-center';
import {ParkplatzProvider} from "../providers/parkplatz/parkplatz";
import { FastaProvider } from '../providers/fasta/fasta';
import {PushPage} from "../pages/push/push";
import { Contacts } from '@ionic-native/contacts';

@NgModule({
  declarations: [
    MyApp,
    AboutPage,
    ContactPage,
    HomePage,
    FastaPage,
    TabsPage,
      PushPage
  ],
  imports: [
      HttpClientModule,
    BrowserModule,
    IonicModule.forRoot(MyApp)
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    AboutPage,
    ContactPage,
    HomePage,
    FastaPage,
    TabsPage, PushPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    StadaProvider,
  InAppBrowser,
    BfotosProvider,
    Geolocation,
    Contacts,
    DataProvider,
    TravelCenterProvider,
    ParkplatzProvider,
    FastaProvider
  ]
})
export class AppModule {}
