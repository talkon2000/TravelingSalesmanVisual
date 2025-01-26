import { LngLatBounds } from "../../node_modules/mapbox-gl/dist/mapbox-gl.js";
import FeatureCollection from "../features/FeatureCollection.js";
import GeoJSONFeature from "../features/GeoJSONFeature.js";
import PointFeature from "../features/PointFeature.js";

export default abstract class RandomPointGenerator {

    /*
        
        Returns the array of random points
    */
    /**
     * Generates random points relative to the number of random points determined by user input.
     * @param bounds LngLatBounds object returned by Map.getBounds();
     * @param num Number of random points to generate.
     * @returns 
     */
    static generate(bounds: LngLatBounds | null, num: number): FeatureCollection {
        if (bounds === null) {
            throw "Map has no bounds";
        }

        function boundedRand(min: number, max: number) {
            return min + (Math.random() * (max - min));
        }

        let randPoints: GeoJSONFeature[] = [];
        for (let i = 0; i < num; i++) {
            randPoints.push(new PointFeature(
                boundedRand(bounds._sw.lat, bounds._ne.lat), 
                boundedRand(bounds._sw.lng, bounds._ne.lng))
            )
        }

        return new FeatureCollection(randPoints);
    }
}