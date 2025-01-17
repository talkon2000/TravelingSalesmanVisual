import Artist from '../../drawOnMap.js'

export default async function arbitraryInsertion(map) {
    //This should be set at the beginning of an algorithm to ensure it runs until interrupted.
    document.getElementById("delay").terminate = false;

    const artist = new Artist();
    //Reset lines since this is a construction algorithm
    if (map.getSource("lines")) {
        map.getSource("lines").setData({ "type": "FeatureCollection", "features": [] });
    }

    //Create a shallow copy of the points
    let points = map.getSource(map.getLayer("points").source)._data.features.slice(0);

    //Path starts at the starting point
    let path = [points.shift()];

    //Randomly sorts the points, then adds one to the path
    points.sort(() => Math.random() -.5);
    path.push(points.pop());

    //Grabs another random point and inserts where it has the lowest impact on total distance
    while (points.length > 0) {
        const nextPoint = points.pop();

        let bestDistance = Infinity;
        let bestIndex = null;
        for (let i = 1; i < path.length; i++) {
            const insertionCost = pathCost(path[i - 1], path[i], nextPoint);
            if(insertionCost < bestDistance) {
                bestDistance = insertionCost;
                bestIndex = i;
            }
        }
        path.splice(bestIndex, 0, nextPoint);
    }

    //Return home
    path.push(path[0]);

    //Draw the path
    for (let i = 1; i < path.length; i++) {
        //This property will be set by the "skip" button.
        //This loop will sleep between each iteration unless the skip button is pressed.
        if (!document.getElementById("delay").disabled) {
            await sleep(document.getElementById("delay").value);
        }
        //This property will be set by the "play" or "stop" button. 
        //This should terminate execution of this algorithm to prepare for another algorithm to be run. 
        if (document.getElementById("delay").terminate) {
            return;
        }
        artist.drawLine(path[i-1], path[i], map);
    }
}

function pathCost(p1, p2, newPoint) {
    return calcDistance(p1, newPoint) + calcDistance(newPoint, p2) - calcDistance(p1, p2);
}

function calcDistance(p1, p2) {
    return Math.sqrt((p1.geometry.coordinates[0] - p2.geometry.coordinates[0]) ^ 2 + (p1.geometry.coordinates[1] - p2.geometry.coordinates[1]) ^ 2);
}

const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay))