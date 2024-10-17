import BindingClass from './utils/bindingClass.js';
import DataStore from './utils/dataStore.js';
import 'https://api.mapbox.com/mapbox-gl-js/v3.7.0/mapbox-gl.js';
import Generator from './generation.js';
import Artist from './drawOnMap.js';

export default class Page extends BindingClass {

    constructor() {
            super();
            this.bindClassMethods(['mount', 'generateRandomPoints'], this);
            this.dataStore = new DataStore();
            this.generator = new Generator();
            this.artist = new Artist();
    }
    /**
     * Add the map to the page and set up event listeners for button.
     */
    async mount() {
        // not secret access
        mapboxgl.accessToken = 'pk.eyJ1Ijoiam9zaG10YXlsb3IyMDAwIiwiYSI6ImNtMjVndGNxYTBzMWkyam9oZzRkaGViaHkifQ.Qz8xkQt513SD8o7JRanfgA';

        const map = new mapboxgl.Map({
            container: 'mapbox', // container ID
            style: 'mapbox://styles/mapbox/dark-v8',
            center: [-74.5, 40], // starting position [lng, lat]. Note that lat must be set between -90 and 90
            zoom: 9, // starting zoom
            maxPitch: 0
        });
        this.dataStore.set("map", map);

        document.getElementById("randomButton").addEventListener("click", this.generateRandomPoints);
    }

    async generateRandomPoints() {
        let points = this.generator.generatePoints(this.dataStore.get("map").getBounds());
        console.log(points);
        //TO DO: draw the points
        console.log(this.artist.drawNewPoints(points, this.dataStore.get("map")));
    }

}

/**
 * Main method to run when the page contents have loaded.
 */
const main = async () => {
    const page = new Page();
    page.mount();

    //leaving this console log here for debugging
    console.log(page.dataStore.get("map"));
}



window.addEventListener('DOMContentLoaded', main);