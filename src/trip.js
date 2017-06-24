// Dependencies
const request = require('request');
const moment = require('moment');
const async = require('async');

// Modules
const Core = require('./core.js')();
const Stop = require('./stop.js')();

function Trip () {

  function get (name) {
    return Core.getTrip(name);
  }

  function list () {
    const trips = Core.getAllTrips();
    const names = Object.keys(trips);
    if (!names.length) {
      console.log('');
      console.log('You haven\'t saved any trips yet.');
      console.log('');
    } else {
      console.log('');
      console.log('––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––');
      names.forEach((name, i) => {
        if (i) console.log('-  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -');
        console.log('| ' + Core.insertCharacters(' ', name.length) + ' |  From:\t' + trips[name].origin.name);
        console.log('| ' + name + ' |  To:\t' + trips[name].destination.name);
        console.log('| ' + Core.insertCharacters(' ', name.length) + ' |  Via:\t' + ((trips[name].via) ? trips[name].via.name:'–'));
      });
      console.log('––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––');
      console.log('');
    }
  }

  function add (params) {
    setup(params)
      .then((options) => {
        const trip = {
          origin: options.origin,
          destination: options.destination,
          via: (options.via) ? options.via:false,
          departure: false,
          arrival: false
        }

        Core.addTrip(trip);
      })
    .catch(error => console.log(error));
  }

  function remove (name) {
    Core.removeTrip(name);
  }

  function setup (params) {
    return new Promise((resolve, reject) => {
      Core.getPlanKey()
        .then((key) => {
          const now = moment();
          const options = {
            key: key,
            date: now.format('YYYY-MM-DD'),
            time: now.format('HH:mm')
          };

          async.eachSeries(params, (obj, callback) => {
            if (!obj.string && !obj.stop) return callback();

            if (obj.stop) {
              options[obj.name] = obj.stop;
              return callback();
            }

            if (Core.getStop(obj.string)) {
              options[obj.name] = Core.getStop(obj.string);
              callback();
            } else {
              Stop.search(obj.string, key)
                .then((stop) => {
                  options[obj.name] = stop;
                  callback();
                })
              .catch(error => reject(error));
            }
          }, () => {
            resolve(options);
          });
        })
      .catch(error => reject(error));
    });
  }

  function search (params) {
    setup(params)
      .then(options => findTrip(options))
    .catch(error => console.log(error));

    function findTrip (options) {
      const url = Core.buildTripSearchUrl(options);

      request.get(url, (err, res, body) => {
        const trips = JSON.parse(body).Trip;
        const origin = options.origin.name;
        const destination = options.destination.name;
        const via = (options.via) ? options.via.name:false;

        console.log('');
        console.log('––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––');
        console.log('');
        console.log(origin + ' -> ' + ((via) ? via + ' -> ':'') + destination);
        console.log('');
        console.log('––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––');
        trips.forEach((trip) => {
          const parts = trip.LegList.Leg;
          parts.forEach((part, x) => {
            console.log('| ' + Core.trimTimeString(part.Origin.time) + ' | ' + ((part.type === 'WALK') ? 'Gå':Core.trimLineName(part.name)));
            console.log('| ' + Core.trimTimeString(part.Destination.time) + ' | ' + part.Origin.name + ' -> ' + part.Destination.name);
            if (x !== (parts.length - 1)) {
              console.log('—  —  —  —  —  —  —  —  —  —  —  —  —  —  —  —  —  —  —  —  —  —  —  —');
            }
          });
          console.log('––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––');
        });
      });
    }
  }

  return {
    get,
    list,
    add,
    remove,
    search
  };
}

module.exports = Trip;
