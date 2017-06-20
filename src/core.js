// Dependencies
const request = require('request');

function Core () {

  function getToken () {
    return new Promise((resolve, reject) => {
      request.get('https://api.tramz.io/token', (error, response, body) => {
        if (error) reject(error);

        resolve(JSON.parse(body).access_token);
      });
    });
  }

  function simplifyStopName (name) {
    return (name.indexOf(',' > -1)) ? name.substring(0, name.indexOf(',')):name;
  }

  return {
    getToken,
    simplifyStopName
  }
}

module.exports = Core;
