import { GeoJSONSource, LngLat, Map } from "../../node_modules/mapbox-gl/dist/mapbox-gl";
import FeatureCollection from "../features/FeatureCollection";
import LineFeature from "../features/LineFeature";
import PointFeature from "../features/PointFeature";
import RandomPointGenerator from "./RandomPointGenerator";

export default class Artist {

    /**
     * This creates a PointFeature from a set of coordinates.
     * @param p LngLat object
     * @returns PointFeature
     * 
    */
    static createPointFeature(p: LngLat): PointFeature {
        return new PointFeature(p.lng, p.lat);
    }

    /**
     * The line feature this creates will branch 2 points.
     * @param p1 PointFeature object
     * @param p2 PointFeature object
     * @returns LineFeature
    */
    static createLineFeature(p1: PointFeature, p2: PointFeature): LineFeature {
        return new LineFeature(p1.getLngLat(), p2.getLngLat());
    }

    /**
     * Draws random points within the bounds of the map
     * @param map Map object
     */
    static drawRandomPoints(map: Map) {
        if (document === null || document.getElementById("numRandomPoints") === null) {
            throw "Cannot find number of random points.";
        }
        let numRandomPoints: number = +(document.getElementById("numRandomPoints") as HTMLInputElement).value;
        let geoPoints: FeatureCollection = RandomPointGenerator.generate(map.getBounds(), numRandomPoints);
        
        //Ensure source "points" exists, then set the data
        let source: GeoJSONSource | undefined = map.getSource('points');
        if (!source) {
            map.addSource('points', { type: 'geojson', data: JSON.stringify(geoPoints) });
        }
        else {
            source.setData(JSON.stringify(geoPoints));
        }
    }

    /**
     * Draws the default points on the map
     * @param map Map object
     */
    static async drawDefaultPoints(map: Map) {
        //Fetch the default points JSON
        const file = await fetch('../static/defaultPoints.geojson');
        const data = await file.json();

        //Ensure source "points" exists, then set the data
        let source: GeoJSONSource | undefined = map.getSource('points');
        if (!source) {
            map.addSource('points', { type: 'geojson', data: data });
        }
        else {
            source.setData(data);
        }
    }

    /**
     * Draws a single point on the map
     * @param p LngLat object
     * @param map Map object
     */
    static drawSinglePoint(p: LngLat, map: Map) {        
        let source: GeoJSONSource | undefined = map.getSource('points');
        if (!source) {
            map.addSource('points', { type: 'geojson', data: JSON.stringify(this.createPointFeature(p)) });
        }
        else {
            console.log(source._data);
            //source.setData(JSON.stringify(new FeatureCollection()));
        }
    }

    drawPath(path, map) {
        //Ensure "lines" source exists in the map, clear all lines from map to prepare for redrawing new path
        let data = { "type": "FeatureCollection", "features": [] };
        if (!map.getSource("lines")) {
            map.addSource("lines", { type: "geojson", data: data});
        }

        if (map.getSource("temporaryLines")) {
            map.getSource("temporaryLines").setData({ "type": "FeatureCollection", "features": [] });
        }
        
        //Crate the line feature, and add it to the data
        //p1 and p2 should be feature objects
        for (let i = 0; i < path.length- 1; i++) {
            data.features.push(this.createLineFeature(path[i], path[i+1], data.features.length));
        }
        map.getSource("lines").setData(data);

        if (!map.getLayer("lines")) {
            map.addLayer({
                id: 'lines',
                type: 'line',
                source: 'lines',
                paint: {
                    "line-color": "#000080",
                    "line-width": 8
                }
            });
        }
    }

    drawLine(p1, p2, map) {
        //Initialize data, ensure "lines" source exists in the map
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
                    "line-width": 8
                }
            });
        }
    }

    /*
    drawTemporaryLine(p1, p2, map) {
        //Initialize data, ensure "temporary lines" source exists in the map
        let data;
        if (map.getSource("temporaryLines")) {
            data = map.getSource("temporaryLines")._data;
        }
        else {
            data = { "type": "FeatureCollection", "features": [] };
            map.addSource("temporaryLines", { type: "geojson", data: data});
        }

        //Crate the line feature, and add it to the data
        //p1 and p2 should be feature objects
        data.features.push(this.createLineFeature(p1, p2, data.features.length));
        map.getSource("temporaryLines").setData(data);

        if (!map.getLayer("temporaryLines")) {
            map.addLayer({
                id: 'temporaryLines',
                type: 'line',
                source: 'temporaryLines',
                paint: {
                    "line-color": "#800000",
                    "line-width": 8
                }
            });
        }
    }
    */
}