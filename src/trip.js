// Dependencies
const request = require('request');
const moment = require('moment');
const async = require('async');

// Modules
const Core = require('./core.js')();
const Location = require('./location.js')();

function Trip () {

  function search (params) {
    Core.getToken()
      .then(token => defineOptions(token))
    .catch(error => console.log(error));

    function defineOptions (token) {
      const now = moment();
      const options = {
        token: token,
        date: now.format('YYYY-MM-DD'),
        time: now.format('HH:mm')
      };

      async.eachSeries(params, (obj, callback) => {
        if (!obj.string) return callback();

        if (Core.getStop(obj.string)) {
          options[obj.name] = Core.getStop(obj.string);
          callback();
        } else {
          Location.find(obj.string, token)
            .then((stop) => {
              options[obj.name] = stop;
              callback();
            })
          .catch(error => callback(error));
        }
      }, (err) => {
        if (err) return console.log('Shit, something bad happened..!', err);

        findTrip(options);
      });
    }

    function findTrip (options) {
      const url = Core.buildTripUrl(options);
      request.get(url, {
        headers: { 'Authorization': 'Bearer ' + options.token }
      }, (err, res, body) => {
        const trips = JSON.parse(body).TripList.Trip;

        const origin = Core.simplifyStopName(options.origin.name);
        const destination = Core.simplifyStopName(options.destination.name);
        const via = (options.via) ? Core.simplifyStopName(options.via.name):false;

        console.log('');
        console.log('----------------------------------------------------------------------');
        console.log('');
        console.log(origin + ' -> ' + ((via) ? via + ' -> ':'') + destination);
        console.log('');
        trips.forEach((trip, i) => {
          const parts = trip.Leg;

          if (!i) {
            console.log('----------------------------------------------------------------------');
          } else {
            console.log('-  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -');
          }
          if (parts.length > 1) {
            parts.forEach((part) => {
              if (part.type === 'WALK') {
                if (part.Origin.name !== part.Destination.name) {
                  console.log('Gå till ' + part.Destination.name + ' Läge ' + part.Destination.track);
                }
              } else {
                console.log('['+part.Origin.time+' - ' + part.Destination.time + '] ' + part.name + ' \t( ' + Core.simplifyStopName(part.Origin.name) + ' [' + part.Origin.track + '] -> ' + Core.simplifyStopName(part.Destination.name) + ' [' + part.Origin.track + '] )');
              }
            });
          } else {
            const part = parts;
            console.log('['+part.Origin.time+' - ' + part.Destination.time + '] ' + part.name + ' – ' + Core.simplifyStopName(part.Origin.name) + ' -> ' + Core.simplifyStopName(part.Destination.name));
          }
        });
        console.log('----------------------------------------------------------------------');
      });
    }
  }

  return {
    search
  };
}

module.exports = Trip;
