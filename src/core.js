// Dependencies
const fs = require('fs');
const readline = require('readline');
const request = require('request');
const async = require('async');
const homeDir = require('home-dir');

function Core () {
  const baseUrls = {
    stopSearch: 'https://api.resrobot.se/v2/location.name',
    tripSearch: 'https://api.resrobot.se/v2/trip'
  }
  const storeDir = homeDir('/.tramz');
  const storeFile = storeDir + '/store.json';
  let data = getStoreData();

  // Will fetch the locally stored data and if it doesn't exist, make sure to create a base.
  function getStoreData () {
    if (!fs.existsSync(storeDir)) {
      fs.mkdirSync(storeDir);
    }
    if (!fs.existsSync(storeFile)) {
      fs.writeFileSync(storeFile, JSON.stringify({ stops: {}, trips: {} }));
    }
    return JSON.parse(fs.readFileSync(storeFile, 'utf8'));
  }

  // Simple method to update the contents of the store file with new data.
  function updateStoreData () {
    fs.writeFileSync(storeFile, JSON.stringify(data));
  }

  // Deprecated method that will fetch the Västtrafik token for the old version (0.2)
  function getToken () {
    return new Promise((resolve, reject) => {
      request.get('https://tramz.solvd.se/token', (error, response, body) => {
        if (error) {
          if (error.code === 'ENOTFOUND') {
            reject('Sorry, but you don\'t seem to have an internet connection, so we can\'t proceed with this action at the moment.');
          } else {
            reject('Oops, something went wrong when contacting the API. Sorry about that.');
          }
          return;
        }

        resolve(JSON.parse(body).token);
      });
    });
  }

  function getPlanKey () {
    return new Promise((resolve, reject) => {
      request('https://tramz.solvd.se/keys/plan', (error, response, body) => {
        if (error) {
          if (error.code === 'ENOTFOUND') {
            reject('Sorry, but you don\'t seem to have an internet connection, so we can\'t proceed with this action at the moment.');
          } else {
            reject('Oops, something went wrong when contacting the API. Sorry about that.');
          }
          return;
        }

        resolve(JSON.parse(body).key);
      });
    });
  }

  function getListKey () {
    return new Promise((resolve, reject) => {

      request('https://tramz.solvd.se/keys/list', (error, response, body) => {
        if (error) {
          if (error.code === 'ENOTFOUND') {
            reject('Sorry, but you don\'t seem to have an internet connection, so we can\'t proceed with this action at the moment.');
          } else {
            reject('Oops, something went wrong when contacting the API. Sorry about that.');
          }
          return;
        }

        resolve(JSON.parse(body).key);
      });
    });
  }

  function buildStopSearchUrl (key, input) {
    let url = baseUrls.stopSearch + '?key=' + key;
    url += '&input=' + encodeURIComponent(input);
    url += '&format=json';
    return url;
  }

  function buildTripSearchUrl (options) {
    let url = baseUrls.tripSearch;
    url += '?key=' + options.key;
    url += '&originId=' + options.origin.id;
    url += '&destId=' + options.destination.id;
    if (options.via) {
      url += '&viaId=' + options.via.id;
    }
    url += '&date=' + options.date + '&time=' + options.time + '&format=json';
    return url;
  }

  function trimTimeString (time) {
    return time.substring(0, 5);
  }

  function trimLineName (name) {
    if (name.indexOf('Länstrafik - ') > -1) {
      name = name.replace('Länstrafik - ', '');
    } else if (name.indexOf('Regional Tåg ') === 0) {
      name = name.replace('Regional Tåg ', '') + '(Regional Tåg)';
    }
    return name;
  }

  function getAllStops () {
    return (data.stops) ? data.stops:{};
  }

  function getStop (key) {
    if (!data.stops || !data.stops[key]) return false;

    return data.stops[key];
  }

  function addStop (stop, name) {
    data.stops[name] = stop;
    updateStoreData();
  }

  function addStopOld (stop) {
    return new Promise((resolve, reject) => {
      data.stops = data.stops || {};
      delete stop.idx;

      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });

      console.log('');
      rl.question('What would you like to save this stop as?\n', (name) => {
        if (!name) {
          rl.close();
          console.log('Yeah, you need to actually write something to choose a name?');
          return console.log('Try again.');
        }

        data.stops[name] = stop;
        updateStoreData();

        console.log('');
        console.log('Success!\n"' + stop.name + '" was saved with the name "' + name +'".');
        console.log('');
        rl.close();

        resolve();
      });
    });
  }

  function removeStop (name) {
    if (!getStop(name)) return console.log('Could not find the stop "' + name + '"');

    delete data.stops[name];
    updateStoreData();
    console.log('The stop "' + name + '" was successfully removed.');
  }

  function getAllTrips () {
    return (data.trips) ? data.trips:{};
  }

  function getTrip (name) {
    if (!data.trips[name]) return false;

    return data.trips[name];
  }

  function addTrip (trip, name) {
    data.trips[name] = trip;
    updateStoreData();
  }

  function addTripOld (trip) {
    return new Promise((resolve, reject) => {
      data.trips = data.trips || {};

      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });

      console.log('');
      rl.question('What would you like to save this trip as?\n', (name) => {
        if (!name) {
          rl.close();
          console.log('Yeah, you need to actually write something to choose a name?');
          return console.log('Try again.');
        }

        data.trips[name] = trip;
        updateStoreData();

        const tripString = 'from "' + trip.origin.name + '" to "' + trip.destination.name + ((trip.via) ? '" via "' + trip.via.name +'"':'"');
        console.log('');
        console.log('Success!\nYour trip ' + tripString + ' was saved as "' + name + '"');
        console.log('');
        rl.close();

        resolve();
      });
    });
  }

  function removeTrip (name) {
    if (!getTrip(name)) return console.log('Could not find the trip "' + name + '".');

    delete data.trips[name];
    updateStoreData();
    console.log('The trip "' + name + '" was successfully removed.');
  }

  function insertCharacters (string, number) {
    let res = '';
    for (let i = 0; i < number; i++) {
      res += string;
    }
    return res;
  }

  function showHelp () {
    console.log('');
    console.log('\x1b[36m%s\x1b[0m', 'Tramz.');
    console.log('');
    console.log('Usage:');
    console.log('\x1b[32m%s\x1b[0m', '  tramz <trip>');
    console.log('  Will search a locally saved trip by name.');
    console.log('');
    console.log('\x1b[32m%s\x1b[0m', '  tramz <origin> <destination> <via (optional)>');
    console.log('  Will search a specific trip from origin to destination, via an optional stop.');
    console.log('');
    console.log('\x1b[32m%s\x1b[0m', '  tramz stops');
    console.log('  Will show a list of your locally saved stops.');
    console.log('');
    console.log('\x1b[32m%s\x1b[0m', '  tramz stops add <string>');
    console.log('  Will find a stop with a name similar to the provided string, and save it locally.');
    console.log('');
    console.log('\x1b[32m%s\x1b[0m', '  tramz stops remove <name>');
    console.log('  Will remove a locally saved stop by the provided name.');
    console.log('');
    console.log('\x1b[32m%s\x1b[0m', '  tramz trips');
    console.log('  Will show a list of your locally saved trips.');
    console.log('');
    console.log('\x1b[32m%s\x1b[0m', '  tramz trips add <origin> <destination> <via (optional)>');
    console.log('  Will search for a trip from origin to destination, via an optional stop, and save it locally.');
    console.log('');
    console.log('\x1b[32m%s\x1b[0m', '  tramz trips remove <name>');
    console.log('  Will remove a locally saved trip based on the provided name.');
    console.log('');
    console.log('Options:');
    console.log('  -h --help \t Will show this screen.');
    console.log('  -v \t\t Will show the installed version.');
    console.log('');
  }

  return {
    data,
    storeDir,
    storeFile,
    updateStoreData,
    getToken,
    getPlanKey,
    getListKey,
    buildStopSearchUrl,
    buildTripSearchUrl,
    trimTimeString,
    trimLineName,
    getAllStops,
    getStop,
    addStop,
    addStopOld,
    removeStop,
    getAllTrips,
    getTrip,
    addTrip,
    addTripOld,
    removeTrip,
    insertCharacters,
    showHelp
  }
}

module.exports = Core;
