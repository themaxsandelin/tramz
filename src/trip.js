// Dependencies
const request = require('request');
const moment = require('moment');

// Modules
const Core = require('./core.js')();
const Store = require('./store.js')();
const Location = require('./location.js')();

function Trip () {

  function search (from, to, fast) {
    const now = moment();
    let fromStop = Store.getStop(from);
    let toStop = Store.getStop(to);

    let orig = (fromStop) ? fromStop.id:undefined;
    let dest = (toStop) ? toStop.id:undefined;
    const date = now.format('YYYY-MM-DD');
    const time = now.format('HH:mm');

    if (!orig) {
      Location.find(from, fast)
        .then((stop) => {
          fromStop = stop;
          orig = stop.id;
          if (!dest) {
            Location.find(to, fast)
              .then((stop) => {
                toStop = stop;
                dest = stop.id;
                performSearch();
              })
            .catch(error => console.log(error));
          }
        })
      .catch(error => console.log(error));
    } else {
      if (!dest) {
        Location.find(to, fast)
          .then((stop) => {
            toStop = stop;
            dest = stop.id;
            performSearch();
          })
        .catch(error => console.log(error));
      } else {
        performSearch();
      }
    }

    function performSearch () {
      // TODO: Add ability to search via another stop

      const url = 'https://api.vasttrafik.se/bin/rest.exe/v2/trip?originId=' + orig + '&destId=' + dest + '&date=' + date + '&time=' + time + '&format=json';
      Core.getToken()
        .then((token) => {
          request.get(url, {
            headers: { 'Authorization': 'Bearer ' + token }
          }, (error, response, body) => {
            const trips = JSON.parse(body).TripList.Trip;

            console.log('');
            console.log('----------------------------------------------------------------------');
            console.log('');
            console.log(Core.simplifyStopName(fromStop.name) + ' -> ' + Core.simplifyStopName(toStop.name));
            console.log('');
            trips.forEach((trip, i) => {
              const parts = trip.Leg;
              // console.log(parts);

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
                    console.log('['+part.Origin.rtTime+' - ' + part.Destination.rtTime + '] ' + part.name + ' \t( ' + Core.simplifyStopName(part.Origin.name) + ' [' + part.Origin.track + '] -> ' + Core.simplifyStopName(part.Destination.name) + ' [' + part.Origin.track + '] )');
                  }
                });
              } else {
                const part = parts;
                console.log('['+part.Origin.rtTime+' - ' + part.Destination.rtTime + '] ' + part.name + ' – ' + Core.simplifyStopName(part.Origin.name) + ' -> ' + Core.simplifyStopName(part.Destination.name));
              }
            });
            console.log('----------------------------------------------------------------------');
          });

        })
      .catch(error => console.log(error));
    }
  }

  return {
    search
  };
}

module.exports = Trip;
