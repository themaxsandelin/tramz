const baseUrl = 'https://api.resrobot.se/v2/trip';
const key = '05d46e8b-09cf-4848-b355-089315347edd';

const origin = 'hej';
const destination = 'hej';
const via = 'hej';

let url = 'https://api.resrobot.se/v2/trip?key=' + key;
url += '&originId=' + origin;
url += '&destId=' + destination;
url += '&viaId=' + via;
url += 'format=json';

console.log( url );
