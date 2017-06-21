# Tramz
A CLI client that uses Västtrafiks API to make it super easy for you to search trips and/or stops, and also save them locally to make finding the next bus/tram much easier.

## Installation
`$ npm install -g tramz`

## Usage
`$tramz [command]`

#### trams [trip]
Will search a trip you have saved locally.
```bash
$ tramz homeToWork
```


#### tramz [origin] [destination] [via (optional)]
Will search for a trip from **origin** to **destination**, with an optional **via** stop.
```bash
$ tramz 'Askims Stationsväg' 'Solrosgatan' 'Nordstan'
```

### Stops

#### tramz stops
Will list the stops you have saved locally.

#### tramz stops add [string]
Will search for a stop with a name similar to the string you provided and save it for you locally.

#### tramz stops remove [name]
Will remove a stop that you have saved locally based on the name you assigned to it.

### Trips

#### tramz trips
Will list the trips you have saved locally.

#### tramz trips add [origin] [destination] [via (optional)]
Will search for a trip from **origin** to **destination**, with an optional **via** stop and then save it locally for you.

#### tramz trips remove [name]
Will remove a trip that you have saved locally based on the name you assigned to it.

## License
[MIT](LICENSE) © [Max Sandelin](https://maxsandelin.com)
