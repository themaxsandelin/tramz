#! /usr/bin/env node

// Modules
const Stop = require('./src/stop.js')();
const Trip = require('./src/trip.js')();

const args = process.argv.splice(2, process.argv.length);

if (args[0] === 'stops') {
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
