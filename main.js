import './style.css';
import { Map, View } from 'ol';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import TileWMS from 'ol/source/TileWMS.js';
import VectorTileLayer from 'ol/layer/VectorTile.js';
import VectorTileSource from 'ol/source/VectorTile.js';
import MVT from 'ol/format/MVT.js';
import { applyStyle } from 'ol-mapbox-style';

const wmsUrl = 'http://localhost/mapserver2/?map=D:/GitHub/mapserver-mvt/demo.map';

const templateUrl = wmsUrl + "&SERVICE=WMS&VERSION=1.3.0&REQUEST=GetMap&LAYERS=countries&CRS=EPSG:3857&WIDTH={width}&HEIGHT={height}&BBOX={bbox}&FORMAT=mvt";

// apply a custom tileUrlFunction in order to create a valid URL
// to retrieve the Vector Tiles via WMS facade
const tileUrlFunction = function (coord) {
    const source = this;
    const bbox = source.getTileGrid().getTileCoordExtent(coord);
    const tileSize = source.getTileGrid().getTileSize(coord);

    const url = templateUrl
        .replace('BBOX={bbox}', 'BBOX=' + bbox.toString())
        .replace('WIDTH={width}', 'WIDTH=' + tileSize)
        .replace('HEIGHT={height}', 'HEIGHT=' + tileSize);

    return url;
};

const vectorTileLayer = new VectorTileLayer({
    source: new VectorTileSource({
        format: new MVT(),
        tileUrlFunction: tileUrlFunction,
    }),
});

const wmsLayer = new TileLayer({
    source: new TileWMS({
        url: wmsUrl,
        params: {
            'LAYERS': 'countries',
            'TILED': true
        },
        serverType: 'mapserver'
    })
});

const baseLayer = new TileLayer({
    source: new OSM()
})

const map = new Map({
    target: 'map',
    layers: [
        //baseLayer
        //wmsLayer
        //vectorTileLayer
    ],
    view: new View({
        center: [0, 0],
        zoom: 2
    })
});


fetch('countries.json')
    .then((r) => r.json())
    .then((glStyle) => {
        applyStyle(vectorTileLayer, glStyle)
        if (map.getLayers().getArray().indexOf(vectorTileLayer) === -1) {
            map.addLayer(vectorTileLayer);
        }
    });
