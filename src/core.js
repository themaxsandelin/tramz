// Dependencies
const fs = require('fs');
const readline = require('readline');
const request = require('request');

function Core () {
  const storeFile = './store/store.json';

  // Make sure the store file exists and is a proper Object
  if (!fs.existsSync(storeFile) || fs.readFileSync(storeFile) === '') fs.writeFileSync(storeFile, JSON.stringify({}));
  let data = JSON.parse(fs.readFileSync(storeFile, 'utf8'));

  function getToken () {
    return new Promise((resolve, reject) => {
      request.get('https://api.tramz.io/token', (error, response, body) => {
        if (error) reject(error);

        resolve(JSON.parse(body).token);
      });
    });
  }

  function buildTripUrl (options) {
    let url = 'https://api.vasttrafik.se/bin/rest.exe/v2/trip';
    url += '?originId=' + options.origin.id;
    url += '&destId=' + options.destination.id;
    if (options.via) {
      url += '&viaId=' + options.via.id;
    }
    url += '&date=' + options.date + '&time=' + options.time + '&format=json';
    return url;
  }

  function simplifyStopName (name) {
    return (name.indexOf(',' > -1)) ? name.substring(0, name.indexOf(',')):name;
  }

  function getAllStops () {
    return JSON.parse(fs.readFileSync(storeFile, 'utf8')).stops;
  }

  function getStop (key) {
    if (!data.stops[key]) return false;

    return data.stops[key];
  }

  function addStop (stop) {
    return new Promise((resolve, reject) => {
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });

      console.log('');
      rl.question('Now, what would you like to save this stop as?\n', (name) => {
        if (!name) {
          rl.close();
          console.log('Yeah, you need to actually write something to choose a name?');
          return console.log('Try again.');
        }

        data.stops = data.stops || {};
        delete stop.idx;
        data.stops[name] = stop;
        fs.writeFileSync(storeFile, JSON.stringify(data));
        console.log('');
        console.log('Success!\n"' + stop.name + '" was saved with the name "' + name +'".');
        console.log('');
        rl.close();

        resolve();
      });
    });
  }

  function removeStop (stop) {
    delete data.stops[stop];
    fs.writeFileSync(storeFile, JSON.stringify(data));
  }

  return {
    getToken,
    buildTripUrl,
    simplifyStopName,
    addStop,
    getAllStops,
    getStop,
    removeStop
  }
}

module.exports = Core;
