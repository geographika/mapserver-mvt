import './style.css'
import { Map, View } from 'ol'
import TileLayer from 'ol/layer/Tile'
import OSM from 'ol/source/OSM'
import TileWMS from 'ol/source/TileWMS.js'
import VectorTileLayer from 'ol/layer/VectorTile.js'
import VectorTileSource from 'ol/source/VectorTile.js'
import MVT from 'ol/format/MVT.js'
import MapboxParser from 'geostyler-mapbox-parser'
import OpenLayersParser from 'geostyler-openlayers-parser'
import SLDParser from 'geostyler-sld-parser'

import { setupInteractions } from './interactions.js'

// update the following to the MapServer URL
const wmsUrl = 'https://api.mapserverstudio.net/mapserver/?map=/etc/mapserver/mapfiles/mvt.map&'

const templateUrl = wmsUrl + 'SERVICE=WMS&VERSION=1.3.0&REQUEST=GetMap&LAYERS=countries&CRS=EPSG:3857&' +
    'WIDTH={width}&HEIGHT={height}&BBOX={bbox}&FORMAT=mvt'

// apply a custom tileUrlFunction in order to create a valid URL
// to retrieve the Vector Tiles via WMS facade
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

const wmsLayer = new TileLayer({
    source: new TileWMS({
        url: wmsUrl,
        params: {
            LAYERS: 'countries',
            TILED: true
        },
        serverType: 'mapserver'
    }),
    visible: false,
    title: 'WMS Layer'
})

const baseLayer = new TileLayer({
    source: new OSM(),
    visible: false,
    title: 'Basemap'
})

const map = new Map({
    target: 'map',
    layers: [
        baseLayer,
        wmsLayer,
        vectorTileLayer
    ],
    view: new View({
        center: [0, 0],
        zoom: 1
    })
})

setupInteractions(map, vectorTileLayer)

const olParser = new OpenLayersParser()

// Wrapper function
const withLogging = (fn) => {
    return function (...args) {
        console.log(`Calling function ${fn.name} with arguments: ${args.join(', ')}`)
        const result = fn.apply(this, args)
        console.log(`Function ${fn.name} returned: ${result}`)
        return result
    }
}

const useSLD = true

if (useSLD) {
    const sldParser = new SLDParser()

    fetch('data/countries.xml')
        .then((r) => r.text())
        .then(async (myStyle) => {
            const { output: gsStyle } = await sldParser.readStyle(myStyle)
            const { output: olStyle } = await olParser.writeStyle(gsStyle)
            vectorTileLayer.setStyle(olStyle)
            if (map.getLayers().getArray().indexOf(vectorTileLayer) === -1) {
                map.addLayer(vectorTileLayer)
            }
        })
} else {
    const mbParser = new MapboxParser()

    fetch('data/countries.json')
        .then((r) => r.json())
        .then(async (myStyle) => {
            const { output: gsStyle } = await mbParser.readStyle(myStyle)
            const { output: olStyle } = await olParser.writeStyle(gsStyle)
            console.log(olStyle)
            vectorTileLayer.setStyle(withLogging(olStyle))

            if (map.getLayers().getArray().indexOf(vectorTileLayer) === -1) {
                map.addLayer(vectorTileLayer)
            }
        })
}
