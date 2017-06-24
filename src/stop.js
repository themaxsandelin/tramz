// Dependencies
const request = require('request');
const readline = require('readline');

// Modules
const Core = require('./core.js')();

function Stop () {

  function list () {
    const stops = Core.getAllStops();
    const names = Object.keys(stops);
    if (!names.length) {
      console.log('');
      console.log('You haven\'t saved any stops yet.');
      console.log('');
    } else {
      console.log('');
      console.log('----------------------------------------------------------------------');
      names.forEach((name, i) => {
        if (i) console.log('-  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -');
        console.log('[' + name + '] – ' + stops[name].name + ' (ID: ' + stops[name].id + ')');
      });
      console.log('----------------------------------------------------------------------');
      console.log('');
    }
  }

  function add (string) {
    Core.getPlanKey()
      .then(key => search(string, key))
      .then(stop => Core.addStop(stop))
    .catch(error => console.log(error));
  }

  function remove (string) {
    Core.removeStop(string);
  }

  function search (input, key) {
    return new Promise((resolve, reject) => {
      const url = Core.buildStopSearchUrl(key, input);

      console.log('');
      console.log('Searching for ' + input + '..');
      request.get(url, (error, response, body) => {
        const stops = JSON.parse(body).StopLocation;

        if (!stops.length) {
          console.log('Could not find a stop with a name similar to ' + input);
        } else if (stops.length === 1) {
          console.log('Found only one result (' + stops[0].name + '), so I chose that for you. :)');
          resolve(stops[0]);
        } else {
          chooseStop(stops).then(stop => resolve(stop));
        }
      });
    });

    function chooseStop (stops) {
      return new Promise((resolve, reject) => {
        console.log('');
        console.log('We found the following stops with a name similar to "' + input + '"');
        console.log('----------------------------------------------------------------------');
        stops.forEach((stop, i) => {
          if (i) console.log('-  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -');
          console.log('| ' + (i+1) + ' | ' + stop.name);
        });
        console.log('----------------------------------------------------------------------');
        console.log('');

        askToChoose(stops).then((stop) => {
          resolve(stop);
        });
      });

      function askToChoose (stops) {
        return new Promise((resolve, reject) => {
          const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
          });

          console.log('Select one of the stops above using the number assigned to it: ');
          rl.on('line', (answer) => {
            const check = validateChoice(answer);
            rl.close();
            if (!check.valid) {
              console.log('');
              console.log(check.error);
              console.log('');
              return askToChoose(stops).then((stop) => resolve(stop));
            }
            resolve(stops[check.answer - 1]);
          });
        });
      }

      function validateChoice (answer) {
        const num = parseInt(answer);
        if (isNaN(num)) {
          return {
            valid: false,
            error: 'Hey, that\'s not a number.. -_-'
          };
        }
        if (num <= 0) {
          return {
            valid: false,
            error: 'Yeah, you\'re going to have to use a number greater than 0. Duh?'
          };
        }
        if (num > stops.length) {
          return {
            valid: false,
            error: 'Uhm, that\'s more than the number of stops you can choose?'
          };

        }
        return { valid: true, answer: num };
      }
    }
  }

  return {
    add,
    remove,
    list,
    search
  }
}

module.exports = Stop;
