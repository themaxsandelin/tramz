// Dependencies
const dotenv = require('dotenv').config();

// Modules
const Core = require('./src/core.js')();

Core.getToken()
  .then((results) => {
    console.log(results);
  })
.catch((error) => {
  console.log(error);
});
