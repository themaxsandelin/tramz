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
This also works for locally saved stops.
```bash
$ tramz home work starbucks
```

### Stops

#### stops
Will list the stops you have saved locally.
```bash
$ tramz stops
```

#### stops add [string]
Will search for a stop with a name similar to the string you provided and save it for you locally.
```bash
$ tramz stops add 'Masthuggstorget'
```

#### stops remove [name]
Will remove a stop that you have saved locally based on the name you assigned to it.
```bash
$ tramz stops remove home
```

### Trips

#### trips
Will list the trips you have saved locally.
```bash
$ tramz trips
```

#### trips add [origin] [destination] [via (optional)]
Will search for a trip from **origin** to **destination**, with an optional **via** stop and then save it locally for you.
```bash
$ tramz trips add 'Askims Stationsväg' 'Solrosgatan' 'Nordstan'
```

#### trips remove [name]
Will remove a trip that you have saved locally based on the name you assigned to it.
```bash
$ tramz trips remove homeToWork
```

## License
[MIT](LICENSE) © [Max Sandelin](https://maxsandelin.com)
