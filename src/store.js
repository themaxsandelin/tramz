// Dependencies
const fs = require('fs');

function Store () {
  const storeFile = './store/store.json';

  // Make sure the store file exists and is a proper Object
  if (!fs.existsSync(storeFile) || fs.readFileSync(storeFile) === '') fs.writeFileSync(storeFile, JSON.stringify({}));
  let store = JSON.parse(fs.readFileSync(storeFile, 'utf8'));

  function getAllStops () {
    return JSON.parse(fs.readFileSync(storeFile, 'utf8')).stops;
  }

  function addNewStop (key, stop) {
    return new Promise((resolve, reject) => {
      if (!store.stops) store.stops = {};
      store.stops[key] = stop;
      fs.writeFileSync(storeFile, JSON.stringify(store));
      resolve();
    });
  }

  return {
    addNewStop,
    getAllStops
  };
}

module.exports = Store;
