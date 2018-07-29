import {Injectable} from '@angular/core';

@Injectable()
export class DataProvider {
    public aktStation: any;
    public pps: any;
    public parkingspaces;
    public pid: any;
    public settings;
    // public settings = new Map<string, boolean>();


    public keys = [
        "DBinformation",
        "hasLocalPublicTransport",
        "hasTaxiRank",
        "hasCarRental",
        "hasParking",
        "hasTravelCenter",
        "hasPublicFacilities",
        "hasLockerSystem",
        "hasSteplessAccess",
        "hasMobilityService",
        "hasLostAndFound",
        "hasDBLounge",
        "hasWifi",
        "hasRailwayMission"
    ];

    constructor() {
        console.log('Hello DataProvider Provider');
        type Setting = { key: string; show: boolean };
        let settings: Setting[] = [];

        for(let k of this.keys) {
            settings.push({key : k , show : true})
        }

        this.settings = settings;
        //
        // this.settings.push(["DBinformation"] = true);
        // this.settings["hasLocalPublicTransport"] = true;
        // this.settings["hasTaxiRank"] = true;
        // // this.settings["DBinformation"] = true;
        // // this.settings.set("hasLocalPublicTransport", true);
        // // this.settings.set("hasTaxiRank", true);
        // // this.settings.set("DBinformation", true);
        // // this.settings.set("DBinformation", true);
        // // this.settings.set("DBinformation", true);
        // // this.settings.set("DBinformation", true);
        // // this.settings.set("DBinformation", true);
        // // this.settings.set("DBinformation", true);
        // // this.settings.set("DBinformation", true);
    }
}
