// Dependencies
const dotenv = require('dotenv').config();
const request = require('request');

function Core () {

  function getToken () {
    return new Promise((resolve, reject) => {
      const key = process.env.KEY;
      const secret = process.env.SECRET;

      request.post('https://api.vasttrafik.se:443/token', {
        headers: {
          'Authorization': 'Basic ' + new Buffer(key + ':' + secret).toString('base64')
        },
        body: 'grant_type=client_credentials'
      }, (error, response, body) => {
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
