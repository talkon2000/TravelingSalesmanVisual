import { GeoJSONSource, LngLat, Map } from "../../node_modules/mapbox-gl/dist/mapbox-gl.js";
import FeatureCollection from "../features/FeatureCollection.ts";
import LineFeature from "../features/LineFeature.ts";
import PointFeature from "../features/PointFeature.ts";
import RandomPointGenerator from "./RandomPointGenerator.ts";

export default class Artist {

    public static permLineSource: string = "permLines";
    public static tempLineSource: string = "tempLines";
    public static pointSource: string = "points";

    /**
     * This method ensures that the Map object passed to it has the necessary sources and layers to manipulate.
     * @param map Map object
     * @returns the modified map object
     */
    static async setupMap(map: Map): Promise<void> {
        //Loads the iamge for the map pins
        map.loadImage('../static/location-pin.png', (error, image) => {
            if (error) throw error;
            map.addImage('mapPin', image as ImageBitmap);
        });

        //Ensures sources for points, temporary lines, and permanent lines exist.
        let pSource: GeoJSONSource | undefined = map.getSource(this.pointSource);
        if (!pSource) {
            map.addSource(this.pointSource, { type: 'geojson', data: JSON.stringify(new FeatureCollection()) });
        } else {
            pSource.setData(JSON.stringify(new FeatureCollection()));
        }
        let permSource: GeoJSONSource | undefined = map.getSource(this.permLineSource);
        if (!permSource) {
            map.addSource(this.permLineSource, { type: 'geojson', data: JSON.stringify(new FeatureCollection()) });
        } else {
            permSource.setData(JSON.stringify(new FeatureCollection()));
        }
        let tempSource: GeoJSONSource | undefined = map.getSource(this.tempLineSource);
        if (!tempSource) {
            map.addSource(this.tempLineSource, { type: 'geojson', data: JSON.stringify(new FeatureCollection()) });
        } else {
            tempSource.setData(JSON.stringify(new FeatureCollection()));
        }

        //Ensures layers for points, temporary lines, and permanent lines exist, and they are formatted correctly.
        let pLayer = map.getLayer(this.pointSource);
        if (pLayer) {
            map.removeLayer(this.pointSource);
        } 
        map.addLayer({
            id: this.pointSource,
            type: 'symbol',
            source: this.pointSource,
            layout: {
                'icon-image': 'mapPin',
                'icon-size': .06,
                'icon-allow-overlap': true
            }
        });
        let permLayer = map.getLayer(this.permLineSource);
        if (permLayer) {
            map.removeLayer(this.permLineSource);
        }
        map.addLayer({
            id: this.permLineSource,
            type: 'line',
            source: this.permLineSource,
            paint: {
                "line-color": "#000080",
                "line-width": 6
            }
        });
        let tempLayer = map.getLayer(this.tempLineSource);
        if (tempLayer) {
            map.removeLayer(this.tempLineSource);
        }
        map.addLayer({
            id: this.tempLineSource,
            type: 'line',
            source: this.tempLineSource,
            paint: {
                "line-color": "#404040",
                "line-width": 6
            }
        });

        //Draws the default points
        await Artist.drawDefaultPoints(map);
    }

    /**
     * Clears the map of points and lines, then draws random points within the bounds of the map.
     * @param map Map object to draw points on
     */
    static drawRandomPoints(map: Map, numRandomPoints: number): void {
        //Generate random points
        let geoPoints: PointFeature[] = RandomPointGenerator.generate(map.getBounds(), numRandomPoints);

        //Ensure source "points" exists, then set the data
        let source: GeoJSONSource | undefined = map.getSource(this.pointSource);
        if (source) {
            source.setData(JSON.stringify(new FeatureCollection(geoPoints)));
        }
        else {
            map.addSource(this.pointSource, { type: 'geojson', data: JSON.stringify(geoPoints) });
        }

        //Clear lines off the map
        this.clearAllLines(map);
    }

    /**
     * Clears the map of points and lines, then draws the default points on the map.
     * @param map Map object to draw points on
     */
    static async drawDefaultPoints(map: Map) {
        //Fetch the default points JSON
        const file = await fetch('../static/defaultPoints.geojson');
        const data = await file.json();

        //Ensure source "points" exists, then set the data
        let source: GeoJSONSource | undefined = map.getSource(this.pointSource);
        console.log(source);
        if (source) {
            source.setData(data);
        }
        else {
            map.addSource(this.pointSource, { type: 'geojson', data: data });
        }

        //Clear lines off the map
        this.clearAllLines(map);
    }

    /**
     * Draws a single point on the map. This does not clear the map of points, but does clear it of lines
     * @param p LngLat object representing the point's coordinates
     * @param map Map object to draw points on
     */
    static drawSinglePoint(p: LngLat, map: Map): void {
        let source: GeoJSONSource | undefined = map.getSource(this.pointSource);
        let data: FeatureCollection<PointFeature>;
        let point: PointFeature = this.createPointFeature(p);
        if (source) {
            data = JSON.parse(source._data as string);
            data.addFeature(point);
            source.setData(JSON.stringify(data));
        }
        else {
            data = new FeatureCollection([point]);
            map.addSource(this.pointSource, { type: 'geojson', data: JSON.stringify(data) });
        }

        //Clear lines off the map
        this.clearAllLines(map);
    }

    /**
     * Draws the path on the map by connecting each point feature in sequence.
     * @param path FeatureCollection object consisting of PointFeatures
     * @param map Map object to draw the path on
     */
    static drawPath(path: PointFeature[], map: Map): void {
        //Crate each line feature and add it to the data
        for (let i = 0; i < path.length - 1; i++) {
            this.drawPermLine(path[i], path[i + 1], map);
        }
    }

    /**
     * Adds a line on the map in the "permLines" source. Throws an error if the source does not exist.
     * @param p1 PointFeature object
     * @param p2 PointFeature object
     * @param map Map object to add the line to
     * @returns the LineFeature object that was created
     */
    static drawPermLine(p1: PointFeature, p2: PointFeature, map: Map): LineFeature {
        return this.drawLine(p1, p2, map, this.permLineSource);
    }

    /**
     * Adds a line on the map in the "tempLines" source. Throws an error if the source does not exist.
     * @param p1 PointFeature object
     * @param p2 PointFeature object
     * @param map Map object to add the line to
     * @returns the LineFeature object that was created
     */
    static drawTempLine(p1: PointFeature, p2: PointFeature, map: Map): LineFeature {
        return this.drawLine(p1, p2, map, this.tempLineSource);
    }

    /**
     * Draws a line on the map in the specified source. Adds the source if it did not previously exist in the map 
     * (note: the line won't be visible until a layer uses the new source).
     * @param p1 PointFeature object
     * @param p2 PointFeature object
     * @param map Map object to add the line to
     * @param sourceString The name of the source to add the line to
     * @returns the LineFeature object that was created.
     */
    private static drawLine(p1: PointFeature, p2: PointFeature, map: Map, sourceString: string): LineFeature {
        let data: FeatureCollection<LineFeature>;
        let line: LineFeature = this.createLineFeature(p1, p2);

        let source: GeoJSONSource | undefined = map.getSource(sourceString);
        if (source) {
            data = JSON.parse(source._data as string);
            data.addFeature(line);
            source.setData(JSON.stringify(data));
        }
        else {
            data = new FeatureCollection([line]);
            map.addSource(sourceString, { type: "geojson", data: JSON.stringify(data) });
        }
        return line;
    }


    /**
     * This method clears the lines from the "permLines" and "tempLines" sources.
     * @param map Map object to clear lines from
     * @returns itself to allow for method chaining
     */
    static clearAllLines(map: Map): typeof Artist {
        this.clearTempLines(map).clearPermLines(map);
        this.clearPermLines(map);
        return this;
    }

    /**
     * This method clears the lines from the "tempLines" source.
     * @param map Map object to clear lines from
     * @returns itself to allow for method chaining
     */
    static clearTempLines(map: Map): typeof Artist {
        let tempSource: GeoJSONSource | undefined = map.getSource(this.tempLineSource);
        if (tempSource) {
            tempSource.setData(JSON.stringify(new FeatureCollection()));
        } else {
            map.addSource(this.tempLineSource, { type: 'geojson', data: JSON.stringify(new FeatureCollection()) });
        }
        return this;
    }

    /**
     * This method clears the lines from the "permLines" source.
     * @param map Map object to clear lines from
     * @returns itself to allow for method chaining
     */
    static clearPermLines(map: Map): typeof Artist {
        let permSource: GeoJSONSource | undefined = map.getSource(this.permLineSource);
        if (permSource) {
            permSource.setData(JSON.stringify(new FeatureCollection()));
        } else {
            map.addSource(this.permLineSource, { type: 'geojson', data: JSON.stringify(new FeatureCollection()) });
        }
        return this;
    }

    /**
     * This method clears the points from the "points" source.
     * @param map Map object to clear points from
     * @returns itself to allow for method chaining
     */
    static clearPoints(map: Map): typeof Artist {
        let pointSource: GeoJSONSource | undefined = map.getSource(this.pointSource);
        if (pointSource) {
            pointSource.setData(JSON.stringify(new FeatureCollection()));
        } else {
            map.addSource(this.pointSource, { type: 'geojson', data: JSON.stringify(new FeatureCollection()) });
        }
        return this;
    }

    /**
     * This creates a PointFeature from a set of coordinates.
     * @param p LngLat object
     * @returns PointFeature
    */
    private static createPointFeature(p: LngLat): PointFeature {
        return new PointFeature(p.lng, p.lat);
    }

    /**
     * The line feature this creates will branch 2 points.
     * @param p1 PointFeature object
     * @param p2 PointFeature object
     * @returns LineFeature
    */
    private static createLineFeature(p1: PointFeature, p2: PointFeature): LineFeature {
        return new LineFeature(p1.getLngLat(), p2.getLngLat());
    }
}