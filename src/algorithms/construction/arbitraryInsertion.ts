import { GeoJSONSource, Map } from "../../../node_modules/mapbox-gl/dist/mapbox-gl";
import PointFeature from "../../features/PointFeature";
import Artist from "../../utils/Artist";
import { TSAlgorithm } from "../TSAlgorithm";

export default class ArbitraryInsertionAlgorithm implements TSAlgorithm {

    map: Map;
    points: PointFeature[];
    path: PointFeature[];

    constructor(map: Map) {
        this.map = map;

        //Reset lines since this is a construction algorithm
        Artist.clearAllLines(map);
        
        //Create a shallow copy of the points
        let pointSource: GeoJSONSource | undefined = map.getSource(Artist.pointSource);
        if (pointSource) {
            this.points = (JSON.parse(pointSource._data as string)).getFeatures().slice();
        } else {
            this.points = [];
        }

        //Starting point
        let p1: PointFeature | undefined = this.points.shift();
        
        //Randomly sorts the points
        this.points.sort(() => Math.random() -.5);

        //Seond point
        let p2: PointFeature | undefined = this.points.pop();

        //If both points exist, create the path
        if (p1 && p2) {
            this.path = [p1, p2];
            Artist.drawPath(this.path, this.map);
        } else {
            throw "There must be at least 2 points on the map. Searching sourceID: " + Artist.pointSource;
        }
    }
    
    //Grabs a random point and inserts where it has the lowest impact on total distance
    /**
     * Grabs the next point and inserts it where it has the lowest impact on total distace.
     * @returns 
     */
    public async run(delay: number): Promise<boolean> {
        const nextPoint: PointFeature | undefined = this.points.pop();

        if (!nextPoint) {
            return false;
        }

        let bestDistance: number = Infinity;
        let bestIndex: number = -Infinity;
        for (let i = 1; i < this.path.length; i++) {
            Artist.clearTempLines(this.map);
            const insertionCost = this.pathCost(this.path[i - 1], this.path[i], nextPoint);
            if(insertionCost < bestDistance) {
                bestDistance = insertionCost;
                bestIndex = i;
            }
            //Draw the path as it's being calculated
            Artist.drawTempLine(this.path[i-1], nextPoint, this.map);
            Artist.drawTempLine(nextPoint, this.path[i], this.map);
            await this.sleep(delay);
        }
        this.path.splice(bestIndex, 0, nextPoint);

        Artist.drawPath(this.path, this.map);

        //Return home
        this.path.push(this.path[0]);
        return true;
    }

    private pathCost(p1: any, p2: any, newPoint: any) {
        return this.calcDistance(p1, newPoint) + this.calcDistance(newPoint, p2) - this.calcDistance(p1, p2);
    }
    
    private calcDistance(p1: any, p2: any) {
        return Math.sqrt((p1.geometry.coordinates[0] - p2.geometry.coordinates[0]) ^ 2 + (p1.geometry.coordinates[1] - p2.geometry.coordinates[1]) ^ 2);
    }

    private sleep(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}