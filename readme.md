# MapServer, Vector Tiles, and OpenLayers

This example project uses MapServer to serve out vector tiles, while reusing the symbology from the MapServer Mapfile,
thanks to https://geostyler.org/.

See the online demo at https://geographika.github.io/mapserver-mvt/

Styles can be written once, and used for both vector tiles and WMS services, allowing the same source data to
be easily served out to different clients and platforms. 

<p align="center">
  <img src="https://raw.githubusercontent.com/geographika/mapserver-mvt/main/demo.gif" alt="Demo GIF">
</p>

![Demo Video](https://raw.githubusercontent.com/geographika/mapserver-mvt/main/demo.mp4)

## Building and Deploying

A local version of MapServer can be setup to run locally using the contents of the `/mapserver` folder, which
contains the [source Mapfile](./mapserver/mvt.map) and a sample countries dataset in a [FlatGeobuf](http://flatgeobuf.org/) format.
Alternatively the default MapServer URL `https://api.mapserverstudio.net/mapserver/?map=/etc/mapserver/mapfiles/mvt.map&` can be used. 

Clone this repository, then change into the `mapserver-mvt` directory and start a development server (available at http://localhost:5173):

```
cd D:\GitHub\mapserver-mvt
npm install
npm start
```

To generate a build ready for production:

```
cd D:\GitHub\mapserver-mvt
npm run build
```

Then deploy the contents of the `dist` directory to your server.  You can also run `npm run serve` to serve the results of the `dist` directory for preview.

## How the Vector Tiles are Loaded

The MapServer [Mapfile](./mapserver/mvt.map) is configured to serve both PNG images via WMS, and also [Mapbox Vector Tiles](https://github.com/mapbox/vector-tile-spec).
MapServer serves vector tiles using the same WMS protocol, but using `&FORMAT=mvt` appended to the querystring requests. 

Within the Mapfile the following `OUTPUTFORMAT` is set. This makes use of [GDAL's MVT Driver](https://gdal.org/drivers/vector/mvt.html):

```
OUTPUTFORMAT
    NAME "mvt"
    DRIVER "MVT"
    FORMATOPTION "EDGE_BUFFER=20"
END
```

Within OpenLayers a custom tile function is used to retrieve these tiles through a "WMS facade". This approach was originally created
by [@chrismayer](https://github.com/chrismayer) as part of the [cpsi-mapview project](https://github.com/compassinformatics/cpsi-mapview/pull/120). The functions below
can be seen in [main.js](./src/main.js). 

```js
const tileUrlFunction = function (coord) {
    const source = this
    const bbox = source.getTileGrid().getTileCoordExtent(coord)
    const tileSize = source.getTileGrid().getTileSize(coord)

    const url = templateUrl
        .replace('BBOX={bbox}', 'BBOX=' + bbox.toString())
        .replace('WIDTH={width}', 'WIDTH=' + tileSize)
        .replace('HEIGHT={height}', 'HEIGHT=' + tileSize)

    return url
}

const vectorTileLayer = new VectorTileLayer({
    source: new VectorTileSource({
        format: new MVT(),
        tileUrlFunction
    }),
    title: 'Vector Tile Layer'
})

```

## How the Styling is Applied

The style from the Mapfile was exported to a Mapbox style JSON file using the following command:

```ps1
cd D:\GitHub\mapserver-mvt
npm install geostyler-cli
geostyler-cli -s mapfile -t mapbox -o ./src/data/countries.json mapserver/mvt.map

# for SLD output (currently broken)
# geostyler-cli -s mapfile -t sld -o ./src/data/countries.xml mapserver/mvt.map
```

This converts the symbology in the Mapfile to a MapBox style in a JSON format. 
There is currently an additional step where slashes `/`  need to be removed to work correctly. 
This relates to issue https://github.com/geostyler/geostyler-openlayers-parser/pull/702

The GeoStyler library is then used in [main.js](./src/main.js) to read this JSON file and convert it into an OpenLayers style which is then
applied to the layer. 

## Using SLD

GeoStyler also allows conversion directly from SLD to OpenLayers without the need to do the offline conversion
above. 

Unfortunately MapServer doesn't currently support exporting list expressions used in the example Mapfile to SLD. 
See [List Expressions not output to SLD #6911](https://github.com/MapServer/MapServer/issues/6911). 

The JS code is included in this sample project to convert from SLD to OpenLayers, but commented out. 
This would be the preferred approach as it skips the offline conversion step, as MapServer can dynamically
serve SLD through a WMS `GetStyles` URL, for example:

https://api.mapserverstudio.net/mapserver/?map=/etc/mapserver/mapfiles/mvt.map&SERVICE=WMS&VERSION=1.3.0&REQUEST=GetStyles&LAYERS=countries

