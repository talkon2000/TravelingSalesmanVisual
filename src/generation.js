import BindingClass from "./utils/bindingClass.js";

export default class Generator extends BindingClass {

    constructor() {
        super();
        this.bindClassMethods(['generatePoints', 'boundedRand'], this);
    }

    /*
        Takes in the bounds of the map, generates pseudo-random points relative to the number of random points determined by user input.
        Returns the array of random points
    */
    generatePoints(bounds) {
        let numRandomPoints = document.getElementById("numRandomPoints").value;
        let randPoints = [];
        for (let i = 0; i < numRandomPoints; i++) {
            let p = {};
            p.lat = this.boundedRand(bounds._sw.lat, bounds._ne.lat);
            p.lng = this.boundedRand(bounds._sw.lng, bounds._ne.lng);
            randPoints[i] = p;
        }

        return randPoints;
    }

    boundedRand(min, max) {
        return min + (Math.random() * (max - min));
    }
}