import 'ol-layerswitcher/dist/ol-layerswitcher.css'
import { Stroke, Style } from 'ol/style'
import Overlay from 'ol/Overlay.js'
import VectorTileLayer from 'ol/layer/VectorTile.js'
import LayerSwitcher from 'ol-layerswitcher'

// see https://openlayers.org/en/latest/examples/vector-tile-selection.html
// lookup for selection objects
let selection = {}

// pop ups

/**
 * Elements that make up the popup.
 */
const container = document.getElementById('popup')
const content = document.getElementById('popup-content')
const closer = document.getElementById('popup-closer')

/**
 * Create an overlay to anchor the popup to the map.
 */
const overlay = new Overlay({
    element: container,
    autoPan: {
        animation: {
            duration: 250
        }
    }
})

/**
 * Add a click handler to hide the popup.
 * @return {boolean} Don't follow the href.
 */
closer.onclick = function () {
    overlay.setPosition(undefined)
    closer.blur()
    return false
}

const selectedCountry = new Style({
    stroke: new Stroke({
        color: 'rgba(100,100,100,0.8)',
        width: 1
    })
})

export function setupInteractions (map, vectorTileLayer) {
    map.addOverlay(overlay)

    // Selection
    const selectionLayer = new VectorTileLayer({
        map,
        renderMode: 'vector',
        source: vectorTileLayer.getSource(),
        style: function (feature) {
            if (feature.getId() in selection) {
                return selectedCountry
            }
        }
    })

    const layerSwitcher = new LayerSwitcher()
    map.addControl(layerSwitcher)

    map.on('pointermove', function (event) {
        if (vectorTileLayer.isVisible() === false) {
            return
        }
        vectorTileLayer.getFeatures(event.pixel).then(function (features) {
            if (!features.length) {
                selection = {}
                selectionLayer.changed()
                return
            }
            const feature = features[0]
            if (!feature) {
                return
            }
            const fid = feature.getId()

            selection = {}
            // add selected feature to lookup
            selection[fid] = feature
            selectionLayer.changed()
        })
    })

    /**
     * Add a click handler to the map to render the popup.
     */
    map.on('singleclick', function (evt) {
        if (vectorTileLayer.isVisible() === false) {
            return
        }

        const coordinate = evt.coordinate

        vectorTileLayer.getFeatures(evt.pixel).then(function (features) {
            if (!features.length) {
                return
            }
            const feature = features[0]
            if (!feature) {
                return
            }
            const text = feature.get('ADM0_A3')
            content.innerHTML = '<p>Country Code: ' + text + '</p>'
            overlay.setPosition(coordinate)
        })
    })
}
