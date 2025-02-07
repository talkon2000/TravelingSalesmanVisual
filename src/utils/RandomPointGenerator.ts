import { LngLatBounds } from "../../node_modules/mapbox-gl/dist/mapbox-gl.js";
import PointFeature from "../features/PointFeature.ts";

export default abstract class RandomPointGenerator {

    /**
     * Generates random points relative to the number of random points determined by user input.
     * @param bounds LngLatBounds object returned by Map.getBounds();
     * @param num Number of random points to generate.
     * @returns the FeatureCollection object containing the PointFeatures generated
     */
    static generate(bounds: LngLatBounds | null, num: number): PointFeature[] {
        if (bounds === null) {
            throw "Map has no bounds";
        }

        function boundedRand(min: number, max: number) {
            return min + (Math.random() * (max - min));
        }

        let randPoints: PointFeature[] = [];
        for (let i = 0; i < num; i++) {
            randPoints.push(new PointFeature(
                boundedRand(bounds._sw.lat, bounds._ne.lat), 
                boundedRand(bounds._sw.lng, bounds._ne.lng))
            )
        }

        return randPoints;
    }
}