# MapServer, Vector Tiles, and OpenLayers

## Building and Deploying

To run:

Then change into the `mapserver-mvt` directory and start a development server (available at http://localhost:5173):

```
cd D:\GitHub\mapserver-mvt
npm start
```

To generate a build ready for production:

```
cd D:\GitHub\mapserver-mvt
npm run build
```

Then deploy the contents of the `dist` directory to your server.  You can also run `npm run serve` to serve the results of the `dist` directory for preview.


## How it Works?

```ps1
cd D:\GitHub\mapserver-mvt
npm install geostyler-cli
geostyler-cli -s mapfile -t mapbox -o ./src/data/countries.json mapserver/mvt.map
```

This converts the symbology in the Mapfile to a MapBox style in a JSON format. 
There is currently an additional step where slashes `/`  need to be removed to work correctly. 
This relates to issue https://github.com/geostyler/geostyler-openlayers-parser/pull/702

## Using SLD

GeoStyler also allows conversion directly from SLD to OpenLayers without the need to do the offline conversion
above. 

Unfortunately MapServer doesn't currently support exporting list expressions used in the example Mapfile to SLD. 
See [List Expressions not output to SLD #6911](https://github.com/MapServer/MapServer/issues/6911). 

The JS code is included in this sample project to convert from SLD to OpenLayers, but commented out. 
This would be the preferred approach as it skips the offline conversion step, as MapServer can dynamically
serve SLD through a WMS `GetStyles` URL, for example:

https://api.mapserverstudio.net/mapserver/?map=/etc/mapserver/mapfiles/mvt.map&SERVICE=WMS&VERSION=1.3.0&REQUEST=GetStyles&LAYERS=countries

