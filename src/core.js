// Dependencies
const fs = require('fs');
const readline = require('readline');
const request = require('request');

function Core () {
  const storeFile = './store/store.json';

  // Make sure the store file exists and is a proper Object
  if (!fs.existsSync('./store')) {
    fs.mkdirSync('./store');
  }
  if (!fs.existsSync(storeFile)) {
    fs.writeFileSync(storeFile, JSON.stringify({}))
  }
  let data = JSON.parse(fs.readFileSync(storeFile, 'utf8'));

  function updateStore () {
    fs.writeFileSync(storeFile, JSON.stringify(data));
  }

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
    return (data.stops) ? data.stops:{};
  }

  function getStop (key) {
    if (!data.stops[key]) return false;

    return data.stops[key];
  }

  function addStop (stop) {
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
        updateStore();

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
    updateStore();
    console.log('The stop "' + name + '" was successfully removed.');
  }

  function getAllTrips () {
    return (data.trips) ? data.trips:{};
  }

  function getTrip (name) {
    if (!data.trips[name]) return false;

    return data.trips[name];
  }

  function addTrip (trip) {
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
        updateStore();

        const tripString = 'from "' + simplifyStopName(trip.origin.name) + '" to "' + simplifyStopName(trip.destination.name) + ((trip.via) ? '" via "' + simplifyStopName(trip.via.name) +'"':'"');
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
    updateStore();
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
    updateStore,
    getToken,
    buildTripUrl,
    simplifyStopName,
    getAllStops,
    getStop,
    addStop,
    removeStop,
    getAllTrips,
    getTrip,
    addTrip,
    removeTrip,
    insertCharacters,
    showHelp
  }
}

module.exports = Core;
