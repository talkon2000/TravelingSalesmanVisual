import BindingClass from "./utils/bindingClass.js";

export default class Artist extends BindingClass {

    constructor() {
        super();
        this.bindClassMethods(['createPointFeature', 'createLineFeature', 'drawRandomPoints', 'drawDefaultPoints'], this);
    }

    /*
    The point feature this creates contains its coordinates, and has a 
    property for its own index in the array of the features
    
    p is a lnglat object, such that (p.lng && p.lat)
    */
    createPointFeature(p, idx) {
        let feature = {};
        feature.type = "Feature";
        feature.geometry = {
            "type": "Point",
            "coordinates": [p.lng, p.lat]
        };
        feature.properties = {
            "index": idx
        };
        return feature;
    }

    /*
    The line feature this creates will branch 2 points, and have a property for its own 
    index in the array of features, as well as the index of both points it links

    p1 and p2 (simplified p) are feature objects, such that 
    (p.geometry.coordinates[0] == lngValue && p.geometry.coordinates[1] == latValue && p.properties.index)
    */
    createLineFeature(p1, p2, idx) {
        let feature = {};
        feature.type = "Feature";
        feature.geometry = {
            "type": "LineString",
            "coordinates": [
                [p1.geometry.coordinates[0], p1.geometry.coordinates[1]],
                [p2.geometry.coordinates[0], p2.geometry.coordinates[1]]
            ]
        };
        feature.properties = {
            "index": idx,
            "p1-index": p1.properties.index,
            "p2-index": p2.properties.index
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
        for (let i = 0; i < geoPoints.length; i++) {
            data.features.push(this.createPointFeature(geoPoints[i], i));
        }
        
        //Re-adds the source and layer
        map.addSource('customPoints', { type: 'geojson', data: data });
        map.addLayer({
            id: 'points',
            type: 'symbol',
            source: 'customPoints',
            layout: {
                'icon-image': 'mapPin',
                'icon-size': .06,
                'icon-allow-overlap': true
            }
        });
    }

    async drawDefaultPoints(map) {
        //Remove original source data and layer
        if (map.getLayer("points")) {
            map.removeLayer("points");
        }
        if (map.getSource("defaultPoints")) {
            map.removeSource("defaultPoints");
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
                'icon-size': .06,
                'icon-allow-overlap': true
            }
        });
    }

    drawSinglePoint(p, map) {
        if (map.getSource("customPoints")) {
            let data = map.getSource("customPoints")._data;
            console.log(data);
            //In order to assign an index to these points, pass the current amount of features.
            //i.e. when creating the second feature, pass a length of 1 to create an index of 1
            data.features.push(this.createPointFeature(p, data.features.length));
            map.getSource("customPoints").setData(data);
        }
        else {
            throw "There is no source called customPoints";
        }
    }

    drawLine(p1, p2, map, /*color*/) {
        //Initialize data, ensure lines source exists in the map
        let data;
        if (map.getSource("lines")) {
            data = map.getSource("lines")._data;
        }
        else {
            data = { "type": "FeatureCollection", "features": [] };
            map.addSource("lines", { type: "geojson", data: data});
        }

        //Crate the line feature, and add it to the data
        //p1 and p2 should be feature objects
        data.features.push(this.createLineFeature(p1, p2, data.features.length));
        map.getSource("lines").setData(data);

        if (!map.getLayer("lines")) {
            map.addLayer({
                id: 'lines',
                type: 'line',
                source: 'lines',
                paint: {
                    "line-color": "#000080",
                    "line-width": 10
                }
            });
        }
    }
}