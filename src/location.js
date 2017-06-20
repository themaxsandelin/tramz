// Dependencies
const request = require('request');
const readline = require('readline');

// Modules
const Core = require('./core.js')();
const Store = require('./store.js')();

function Location () {

  function list () {
    const data = Store.getAllStops();
    console.log('');
    console.log('');
    console.log('These are your locally saved stops.');
    console.log('');
    console.log('----------------------------------------------------------------------');
    console.log('');
    const stops = Object.keys(data);
    stops.forEach((stop) => {
      console.log(stop + ': ' + data[stop].name + ' (id: ' + data[stop].id + ')');
      console.log('');
    });
    console.log('----------------------------------------------------------------------');
    console.log('');
  }

  function add (string) {
    find(string)
      .then(stop => Store.addStop(stop))
    .catch(error => console.log(error));
  }

  function remove (string) {
    if (!Store.getStop(string)) return console.log('Could not found a location by the name of ' + string);

    Store.removeStop(string);
    console.log(string + ' was successfully removed.');
  }

  function find (string, fast) {
    return new Promise((resolve, reject) => {
      Core.getToken()
        .then(token => search(string, token))
        .then(stops => choose(stops, string, fast))
        .then(stop => resolve(stop))
      .catch(error => reject(error));
    });
  }

  function search (string, token) {
    return new Promise((resolve, reject) => {
      console.log('');
      console.log('Searching for ' + string + '...');

      const url = 'https://api.vasttrafik.se/bin/rest.exe/v2/location.name?input=' + string + '&format=json';
      request.get(url, {
        headers: {
          'Authorization': 'Bearer ' + token
        }
      }, (error, response, body) => {
        if (error) console.log(error);

        console.log('Done!');
        resolve(JSON.parse(body).LocationList.StopLocation);
      });
    });
  }

  function choose (stops, string, fast) {
    return new Promise((resolve, reject) => {
      if (fast) return resolve(stops[0]);

      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });

      console.log('');
      console.log('We found the following stops with a name related to "' + string + '":');
      console.log('');
      stops.forEach((stop, i) => {
        console.log('[ ' + (i + 1) + ' ] ' + stop.name);
      });
      console.log('');
      rl.question('Please select one of the above by typing in the number associated with the stop: ', (answer) => {
        const num = parseInt(answer);
        if (isNaN(num)) {
          rl.close();
          console.log('Hey, that\'s not a number.. -_-');
          return console.log('Try again.');
        }
        if (num <= 0) {
          rl.close();
          console.log('Yeah, you\'re going to have to use a number greater than 0. Duh?');
          return console.log('Try again.');
        }
        if (num > stops.length) {
          rl.close();
          console.log('Uhm, that\'s more than the number of stops you can choose?');
          return console.log('Try again.');
        }

        rl.close();
        resolve(stops[num-1]);
      });
    });
  }

  return {
    add,
    remove,
    list,
    find
  }
}

module.exports = Location;
