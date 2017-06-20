// Dependencies
const fs = require('fs');
const readline = require('readline');

function Store () {
  const storeFile = './store/store.json';

  // Make sure the store file exists and is a proper Object
  if (!fs.existsSync(storeFile) || fs.readFileSync(storeFile) === '') fs.writeFileSync(storeFile, JSON.stringify({}));
  let store = JSON.parse(fs.readFileSync(storeFile, 'utf8'));

  function getAllStops () {
    return JSON.parse(fs.readFileSync(storeFile, 'utf8')).stops;
  }

  function getStop (key) {
    if (!store.stops[key]) return false;

    return store.stops[key];
  }

  function addStop (stop) {
    return new Promise((resolve, reject) => {
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });

      rl.question('Now, what would you like to save this stop as?\n', (name) => {
        if (!name) {
          rl.close();
          console.log('Yeah, you need to actually write something to choose a name?');
          return console.log('Try again.');
        }

        if (!store.stops) store.stops = {};
        store.stops[name] = stop;
        fs.writeFileSync(storeFile, JSON.stringify(store));
        console.log('Success! The stop ' + stop.name + ' was saved as ' + name +'.');
        rl.close();

        resolve();
      });
    });
  }

  function removeStop (stop) {
    delete store.stops[stop];
    fs.writeFileSync(storeFile, JSON.stringify(store));
  }

  return {
    addStop,
    getAllStops,
    getStop,
    removeStop
  };
}

module.exports = Store;
