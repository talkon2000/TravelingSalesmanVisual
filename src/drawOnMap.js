import BindingClass from "./utils/bindingClass.js";

export default class Artist extends BindingClass {

    constructor() {
        super();
        this.bindClassMethods(['addFeature', 'drawRandomPoints', 'drawDefaultPoints'], this);
    }

    addFeature(p) {
        let feature = {};
        feature.type = "Feature";
        feature.geometry = {
            "type": "Point",
            "coordinates": [p.lng, p.lat]
        };
        return feature;
    }

    drawRandomPoints(geoPoints, map) {
        //Remove original source data and layer
        map.removeLayer("points");
        if (map.getSource('customPoints')) {
            map.removeSource('customPoints');
        }

        //Generates the points in GEOJSON format
        let data = { "type": "FeatureCollection", "features": [] };
        for (let p = 0; p < geoPoints.length; p++) {
            data.features.push(this.addFeature(geoPoints[p]));
        }
        
        //Re-adds the source and layer
        map.addSource('customPoints', { type: 'geojson', data: data });
        map.addLayer({
            id: 'points',
            type: 'symbol',
            source: 'customPoints',
            layout: {
                'icon-image': 'mapPin',
                'icon-size': .06
            }
        });
    }

    async drawDefaultPoints(map) {
        //Remove original source data and layer
        if (map.getLayer("points")) {
            map.removeLayer("points");
        }
        if (map.getSource('customPoints')) {
            map.removeSource('customPoints');
        }
        //Fetch the default points JSON
        const file = await fetch('../static/defaultPoints.geojson');
        const data = await file.json();
        //Inializes default points source
        map.addSource('defaultPoints', { type: 'geojson', data: data });
        //Creates the layer with default points as the source
        map.addLayer({
            id: 'points',
            type: 'symbol',
            source: 'defaultPoints',
            layout: {
                'icon-image': 'mapPin',
                'icon-size': .06
            }
        });
    }
}