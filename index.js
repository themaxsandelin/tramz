// Modules
const Location = require('./src/location.js')();
const Trip = require('./src/trip.js')();

const args = process.argv.splice(2, process.argv.length);

if (args[0] === 'stops') {
  if (args[1] === 'add') {
    if (args[2]) {
      return Location.add(args[2]);
    }
  } else if (args[1] === 'remove')  {
    if (args[2]) {
      return Location.remove(args[2]);
    }
  } else if (args[1] === 'list') {
    return Location.list();
  }
} else if (args[0] === 'from') {
  if (args[2] === 'to') {
    const origin = args[1];
    const destination = args[3];

    let fast = false;
    if (args[4]) fast = (args[4] === '-s');
    return Trip.search(origin, destination, fast);
  }
}

console.log('Invalid command.');
