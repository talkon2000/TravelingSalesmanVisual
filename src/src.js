import BindingClass from './utils/bindingClass.js';
import DataStore from './utils/dataStore.js';
import 'https://api.mapbox.com/mapbox-gl-js/v3.7.0/mapbox-gl.js';

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
    }
}

/**
 * Main method to run when the page contents have loaded.
 */
const main = async () => {
    const page = new Page();
    page.mount();   
};

window.addEventListener('DOMContentLoaded', main);