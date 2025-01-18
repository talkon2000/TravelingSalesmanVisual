import { TSAlgorithm } from "../TSAlgorithm";

export class ArbitraryInsertionAlgorithm implements TSAlgorithm {

    artist: any;
    map: any;
    points: any[];
    path: any[];

    public constructor(artist: any, map: any) {
        this.artist = artist;
        this.map = map;

        
        //Reset lines since this is a construction algorithm
        if (map.getSource("lines")) {
            map.getSource("lines").setData({ "type": "FeatureCollection", "features": [] });
        }
        //Create a shallow copy of the points
        this.points = map.getSource(map.getLayer("points").source)._data.features.slice(0);
        //Path starts at the starting point
        this.path = [this.points.shift()];

        //Randomly sorts the points, then adds one to the path
        this.points.sort(() => Math.random() -.5);
        this.path.push(this.points.pop());
        this.artist.drawLine(this.path[this.path.length - 2], this.path[this.path.length - 1], this.map);
    }
    
    //Grabs a random point and inserts where it has the lowest impact on total distance
    public run(): boolean {
        const nextPoint: any = this.points.pop();

        if (!nextPoint) {
            return false;
        }

        let bestDistance: number = Infinity;
        let bestIndex: number = -Infinity;
        for (let i = 1; i < this.path.length; i++) {
            const insertionCost = this.pathCost(this.path[i - 1], this.path[i], nextPoint);
            if(insertionCost < bestDistance) {
                bestDistance = insertionCost;
                bestIndex = i;
            }
            //Draw the path as it's being calculated
            //this.artist.drawTemporaryLine(this.path[i-1], this.path[i], this.map);
        }
        this.path.splice(bestIndex, 0, nextPoint);

        this.artist.drawPath(this.path, this.map);

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
}