import BindingClass from './utils/bindingClass';
import DataStore from './utils/dataStore';
import MapBox from 'https://api.mapbox.com/mapbox-gl-js/v3.7.0/mapbox-gl.js';

export default class Page extends BindingClass {

    constructor() {
            super();
            this.bindClassMethods(['mount'], this);
            this.dataStore = new DataStore();
    }
    /**
     * Add the map to the page.
     */
    async mount() {
        MapBox.accessToken = 'pk.eyJ1Ijoiam9zaG10YXlsb3IyMDAwIiwiYSI6ImNtMjVndGNxYTBzMWkyam9oZzRkaGViaHkifQ.Qz8xkQt513SD8o7JRanfgA';

        const mapContainer = document.getElementById("mapbox");
        const map = new MapBox.Map({
            container: mapContainer, // container ID
            style: 'mapbox://styles/mapbox/dark-v8',
            center: [-74.5, 40], // starting position [lng, lat]. Note that lat must be set between -90 and 90
            zoom: 9, // starting zoom
            maxPitch: 0
        });
        this.dataStore.set("map", map);
    }
}

/**
 * Main method to run when the page contents have loaded.
 */
const main = async () => {
    const page = new Page();
    document.getElementById("bestDistance").innerHTML = "pasta";
    page.mount();   
};

window.addEventListener('DOMContentLoaded', main);