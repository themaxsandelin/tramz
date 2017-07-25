#! /usr/bin/env node

// Dependencies
const fs = require('fs');
const rimraf = require('rimraf');
const async = require('async');
const homeDir = require('home-dir');

// Modules
const Package = require('./package.json');
const Core = require('./src/core.js')();
const Stop = require('./src/stop.js')(Core);
const Trip = require('./src/trip.js')(Core, Stop);

// Store migration from 0.2 to 1.0
// Migration script to migrate the old store data to the new folder and accommodate for the new IDs from Resrobot.
if (fs.existsSync(homeDir('/store')) && fs.existsSync(homeDir('/store/store.json'))) {
  const oldData = JSON.parse(fs.readFileSync(homeDir('/store/store.json')));
  const migrationData = [];

  // Migrate stops
  if (oldData.stops) {
    const stopNames = Object.keys(oldData.stops);
    stopNames.forEach((name, i) => {
      const stop = oldData.stops[name];
      migrationData.push({
        key: name,
        name: stop.name,
        type: 'stop'
      });
    });
  }

  // Migrate trips
  if (oldData.trips) {
    const tripNames = Object.keys(oldData.trips);
    tripNames.forEach((name, i) => {
      const trip = oldData.trips[name];
      migrationData.push({
        key: name,
        origin: { name: trip.origin.name, type: 'origin'},
        destination: { name: trip.destination.name, type: 'destination' },
        via: { name: ((trip.via) ? trip.via.name:false), type: 'via' },
        type: 'trip'
      });
    });
  }

  rimraf.sync(homeDir('/store'));

  if (migrationData.length) {
    console.log('');
    console.log('Migrating your old store data. We apologize for the inconvenience.');
    console.log('');
    Core.getPlanKey()
      .then((key) => {
        async.eachSeries(migrationData, (obj, callback) => {
          if (obj.type === 'stop') {
            // Migrate stop.
            Stop.search(obj.name, key).then((stop) => {
              delete stop.weight;
              delete stop.products;
              delete stop.extId;

              Core.addStop(stop, obj.key);
              callback();
            });
          } else {
            // Migrate trip.
            const trip = {};
            async.eachSeries([ obj.origin, obj.destination, obj.via ], (stop, cb) => {
              if (stop.type === 'via' && !stop.name) {
                trip.via = false;
                return cb();
              }
              Stop.search(stop.name, key).then((newStop) => {
                delete newStop.weight;
                delete newStop.products;
                delete newStop.extId;

                trip[stop.type] = newStop;
                cb();
              });
            }, () => {
              Core.addTrip(trip, obj.key);
              callback();
            });
          }
        }, () => {
          console.log('');
          console.log('Store data migrated, thank you for your patience! :)');
          console.log('');
        });
      })
    .catch(error => console.log(error));
  }
}

const args = process.argv.splice(2, process.argv.length);
if (!args.length) {
  console.log('');
  console.log('Tramz is a CLI client for public transit in Sweden.');
  console.log('');
  console.log('  > Type [tramz -h] to see how to use it.');
  console.log('');
  return;
} else if (args[0] === '-h' || args[0] === '--help') {
  return Core.showHelp();
} else if (args[0] === '-v') {
  return console.log(Package.version);
} else if (args[0] === 'stops') {
  if (args[1] === 'add') {
    if (args[2]) {
      return Stop.add(args[2]);
    }
  } else if (args[1] === 'remove')  {
    if (args[2]) {
      return Stop.remove(args[2]);
    }
  } else {
    return Stop.list();
  }
} else if (args[0] === 'trips') {
  if (args[1] === 'add') {
    if (args[2] && args[3]) {
      const orig = args[2];
      const dest = args[3];
      const via = args[4] ? args[4]:false;

      return Trip.add([
        { name: 'origin', string: orig },
        { name: 'destination', string: dest },
        { name: 'via', string: via }
      ]);
    }
  } else if (args[1] === 'remove') {
    if (args[2]) {
      return Trip.remove(args[2]);
    }
  } else {
    return Trip.list();
  }
} else {
  if (args[0]) {
    const value = args[0];
    if (args[1]) {
      const orig = value;
      const dest = args[1];
      const via = (args[2]) ? args[2]:false;

      return Trip.search([
        { name: 'origin', string: orig },
        { name: 'destination', string: dest },
        { name: 'via', string: via }
      ]);
    } else {
      if (Trip.get(value)) {
        const trip = Trip.get(value);

        return Trip.search([
          { name: 'origin', stop: trip.origin },
          { name: 'destination', stop: trip.destination },
          { name: 'via', stop: ((trip.via) ? trip.via:false) }
        ]);
      }
    }
  }
}

console.log('Invalid command.');
