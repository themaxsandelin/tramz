// Dependencies
const dotenv = require('dotenv').config();

// Modules
const Location = require('./src/location.js')();

const args = process.argv.splice(2, process.argv.length);

if (args[0] === 'stops') {
  if (args[1] === 'add') {
    if (args[2]) {
      return Location.addNewStop(args[2]);
    }
  }
}

console.log('Invalid command.');
