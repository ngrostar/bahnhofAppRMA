import {Injectable} from '@angular/core';

@Injectable()
export class DataProvider {
    public aktStation: any;
    public pps: any;
    public parkingspaces;
    public pid: any;
    public settings;
    public settingsBackup;


    public keys = [
        ["DBinformation","Öffnungszeiten"],
        ["hasLocalPublicTransport","ÖPNV"],
        ["hasTaxiRank","Taxistand"],
        ["hasCarRental","Autovermietung"],
        ["hasParking","Parkplätze"],
        ["hasTravelCenter","Reisezentrum"],
        ["hasPublicFacilities","Toiletten"],
        ["hasLockerSystem","Schließfächer"],
        ["hasSteplessAccess","Barrierefreiheit"],
        ["hasMobilityService","Mobilitätsservice"],
        ["hasLostAndFound","Fundbüro"],
        ["hasDBLounge","DBLounge"],
        ["hasWifi","WLAN"],
        ["hasRailwayMission","Bahnhofsmission"]
    ];

    constructor() {
        console.log('Hello DataProvider Provider');
        type Setting = { key: string; name: string; show: boolean };
        let settings: Setting[] = [];
        let backup: Setting[] = [];


        if (localStorage.getItem('settings')) {
            let storedSettingsString = localStorage.getItem('settings').slice(0,-1);
            let storedSettings = storedSettingsString.split("#");
            for(let s of storedSettings) {
                let y = JSON.parse(s);
                settings.push(y);
            }
            this.settings = settings;
            console.log("settings aus storage", this.settings)
        } else {
            for(let k of this.keys) {
                settings.push({key : k[0] , name : k[1], show : true})
            }

            this.settings = settings;
            let settingsString = "";
            for(let s of settings) {
                settingsString += JSON.stringify(s) + ";";
            }
            localStorage.setItem('settings', settingsString);
        }

        for(let k of this.keys) {
            backup.push({key : k[0] , name : k[1], show : true})
        }
        this.settingsBackup = backup;
    }
}
