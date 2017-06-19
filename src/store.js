// Dependencies
const fs = require('fs');

function Store () {
  if (!fs.existsSync('./store/store.json') || fs.readFileSync('./store/store.json', 'utf8') === '') fs.writeFileSync('./store/store.json', JSON.stringify({}));
  let store = JSON.parse(fs.readFileSync('./store/store.json', 'utf8'));

  function addNewStop (key, stop) {
    return new Promise((resolve, reject) => {
      if (!store.stops) store.stops = {};
      store.stops[key] = stop;
      fs.writeFileSync('./store/store.json', JSON.stringify(store));
      resolve();
    });
  }

  return {
    addNewStop
  };
}

module.exports = Store;
