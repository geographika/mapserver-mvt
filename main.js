import './style.css';
import { Map, View } from 'ol';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import TileWMS from 'ol/source/TileWMS.js';
import VectorTileLayer from 'ol/layer/VectorTile.js';
import VectorTileSource from 'ol/source/VectorTile.js';
import MVT from 'ol/format/MVT.js';
import { Fill, Stroke, Style } from 'ol/style';
import MapboxParser from "geostyler-mapbox-parser";
import OpenLayersParser from "geostyler-openlayers-parser";
import SLDParser from 'geostyler-sld-parser';
import Overlay from 'ol/Overlay.js';

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

// pop ups

/**
 * Elements that make up the popup.
 */
const container = document.getElementById('popup');
const content = document.getElementById('popup-content');
const closer = document.getElementById('popup-closer');

/**
 * Create an overlay to anchor the popup to the map.
 */
const overlay = new Overlay({
    element: container,
    autoPan: {
        animation: {
            duration: 250,
        },
    },
});

/**
 * Add a click handler to hide the popup.
 * @return {boolean} Don't follow the href.
 */
closer.onclick = function () {
    overlay.setPosition(undefined);
    closer.blur();
    return false;
};

const map = new Map({
    target: 'map',
    layers: [
        //baseLayer
        //wmsLayer
        //vectorTileLayer
    ],
    overlays: [overlay],
    view: new View({
        center: [0, 0],
        zoom: 2
    })
});


const mbParser = new MapboxParser();
const olParser = new OpenLayersParser();
const sldParser = new SLDParser();

// Wrapper function
const withLogging = (fn) => {
    return function (...args) {
        console.log(`Calling function ${fn.name} with arguments: ${args.join(', ')}`);
        const result = fn.apply(this, args);
        console.log(`Function ${fn.name} returned: ${result}`);
        return result;
    };
};


fetch('countries.json')
    .then((r) => r.json())
    .then(async (myStyle) => {

        const { output: gsStyle } = await mbParser.readStyle(myStyle);
        const { output: olStyle } = await olParser.writeStyle(gsStyle);
        console.log(olStyle);
        vectorTileLayer.setStyle(withLogging(olStyle))

        if (map.getLayers().getArray().indexOf(vectorTileLayer) === -1) {
            map.addLayer(vectorTileLayer);
        }
    });


const selectStyle = new Style({
    fill: new Fill({
        color: '#eeeeee',
    }),
    stroke: new Stroke({
        color: 'rgba(255, 255, 255, 0.7)',
        width: 2,
    }),
});

//fetch('countries.simple.xml')
//    .then((r) => r.text())
//    .then(async (myStyle) => {

//        // const { output: gsStyle } = await mbParser.readStyle(myStyle);
//        const { output: gsStyle } = await sldParser.readStyle(myStyle);
//        const { output: olStyle } = await olParser.writeStyle(gsStyle);

//        vectorTileLayer.setStyle(olStyle)

//        if (map.getLayers().getArray().indexOf(vectorTileLayer) === -1) {
//            map.addLayer(vectorTileLayer);
//        }
//    });

const status = document.getElementById('status');

// see https://openlayers.org/en/latest/examples/vector-tile-selection.html
// lookup for selection objects
let selection = {};

const selectedCountry = new Style({
    stroke: new Stroke({
        color: 'rgba(100,100,100,0.8)',
        width: 1,
    })
});

// Selection
const selectionLayer = new VectorTileLayer({
    map: map,
    renderMode: 'vector',
    source: vectorTileLayer.getSource(),
    style: function (feature) {
        if (feature.getId() in selection) {
            return selectedCountry;
        }
    },
});

map.on('pointermove', function (event) {
    vectorTileLayer.getFeatures(event.pixel).then(function (features) {
        if (!features.length) {
            selection = {};
            selectionLayer.changed();
            return;
        }
        const feature = features[0];
        if (!feature) {
            return;
        }
        const fid = feature.getId();

        selection = {};
        // add selected feature to lookup
        selection[fid] = feature;
        selectionLayer.changed();
    });
});


/**
 * Add a click handler to the map to render the popup.
 */
map.on('singleclick', function (evt) {
    const coordinate = evt.coordinate;

    vectorTileLayer.getFeatures(evt.pixel).then(function (features) {
        if (!features.length) {
            return;
        }
        const feature = features[0];
        if (!feature) {
            return;
        }
        const text = feature.get('ADM0_A3');
        content.innerHTML = '<p>Country Code: ' + text + '</p>';
        overlay.setPosition(coordinate);
    });
});
