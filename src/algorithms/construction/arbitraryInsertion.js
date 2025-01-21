export class ArbitraryInsertionAlgorithm {
    constructor(artist, map) {
        this.artist = artist;
        this.map = map;
        if (map.getSource("lines")) {
            map.getSource("lines").setData({ "type": "FeatureCollection", "features": [] });
        }
        this.points = map.getSource(map.getLayer("points").source)._data.features.slice(0);
        this.path = [this.points.shift()];
        this.points.sort(() => Math.random() - .5);
        this.path.push(this.points.pop());
        this.artist.drawLine(this.path[this.path.length - 2], this.path[this.path.length - 1], this.map);
    }
    run() {
        const nextPoint = this.points.pop();
        if (!nextPoint) {
            return false;
        }
        let bestDistance = Infinity;
        let bestIndex = -Infinity;
        for (let i = 1; i < this.path.length; i++) {
            const insertionCost = this.pathCost(this.path[i - 1], this.path[i], nextPoint);
            if (insertionCost < bestDistance) {
                bestDistance = insertionCost;
                bestIndex = i;
            }
        }
        this.path.splice(bestIndex, 0, nextPoint);
        this.artist.drawPath(this.path, this.map);
        this.path.push(this.path[0]);
        return true;
    }
    pathCost(p1, p2, newPoint) {
        return this.calcDistance(p1, newPoint) + this.calcDistance(newPoint, p2) - this.calcDistance(p1, p2);
    }
    calcDistance(p1, p2) {
        return Math.sqrt((p1.geometry.coordinates[0] - p2.geometry.coordinates[0]) ^ 2 + (p1.geometry.coordinates[1] - p2.geometry.coordinates[1]) ^ 2);
    }
}
