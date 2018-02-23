// import {google} from './src/pages/home/home';
// private geocoder = new google.maps.Geocoder();
//
// findContacts(searchInput) {
//     this.Contacts.find(['addresses', 'name', 'photos'],
//         { filter: searchInput, multiple: true, desiredFields: ['name', 'addresses', 'photos'] })
//         .then((data) => {
//             console.log("Contacts", data);
//             this.contacts = data;
//         });
// }
//
//
// geocode(address) {
//     // let address = street + " " + zipcode + " " + city;
//     console.log('trying to get coords for ' + address);
//     this.geocoder.geocode({ 'address': address }, function (results, status) {
//         if (status == google.maps.GeocoderStatus.OK) {
//
//             let ll = new google.maps.LatLng(50, 8);
//             this.map.setCenter(ll);
//         } else {
//             console.log('Geocode for ' + station.name + ' was not successful for the following reason: ' + status);
//         }
//     });
// }
