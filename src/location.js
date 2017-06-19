// Dependencies
const request = require('request');
const readline = require('readline');

// Modules
const Core = require('./core.js')();
const Store = require('./store.js')();

function Location () {

  function addNewStop (string) {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    const url = 'https://api.vasttrafik.se/bin/rest.exe/v2/location.name?input=' + string + '&format=json';
    console.log('');
    console.log('Searching for ' + string + '...');
    Core.getToken()
      .then(token => {
        request.get(url, {
          headers: {
            'Authorization': 'Bearer ' + token
          }
        }, (error, response, body) => {
          if (error) console.log(error);

          const stops = JSON.parse(body).LocationList.StopLocation;
          console.log('');
          console.log('----------------------------------------------------------------------');
          console.log('');
          console.log('We found the following stops with a name related to "' + string + '".');
          console.log('');
          console.log('----------------------------------------------------------------------');
          console.log('');
          stops.forEach((stop, i) => {
            console.log('[ ' + (i + 1) + ' ] ' + stop.name);
          });
          console.log('');
          console.log('----------------------------------------------------------------------');
          console.log('');

          rl.question('Which stop do you want to select? (select by number): ', (answer) => {
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

            console.log('Cool!');
            const stop = stops[num - 1];
            rl.question('Now, what would you like to save this stop as?\n', (name) => {
              if (!name) {
                console.log('Yeah, you need to actually write something to choose a name?');
                return console.log('Try again.');
              }

              rl.close();
              console.log('Nice!');
              console.log('');
              console.log('Saving new stop..');
              Store.addNewStop(name, stop)
                .then(() => {
                  console.log('Success! The stop ' + stop.name + ' was saved as ' + name +'.');
                })
              .catch(error => reject(error));
            });
          });

        });
      })
    .catch(error => console.log(error));
  }

  return {
    addNewStop
  }
}

module.exports = Location;
