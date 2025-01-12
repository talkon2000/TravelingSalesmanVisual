import BindingClass from './utils/bindingClass.js';
import DataStore from './utils/dataStore.js';
import 'https://api.mapbox.com/mapbox-gl-js/v3.7.0/mapbox-gl.js';
import Generator from './generation.js';
import Artist from './drawOnMap.js';
import arbitraryInsertion from './algorithms/construction/arbitraryInsertion.js';

export default class Page extends BindingClass {

    constructor() {
            super();
            this.bindClassMethods(['mount', 'generateRandomPoints', 'resetToDefaultPoints',
                 'startManualSelection', 'stopManualSelection', 'manualClickEvent', 'runAlgorithm'], this);
            this.dataStore = new DataStore();
            this.generator = new Generator();
            this.artist = new Artist();
    }

    /**
     * Add the map to the page and set up event listeners for button.
     */
    async mount() {
        //not secret access
        mapboxgl.accessToken = 'pk.eyJ1Ijoiam9zaG10YXlsb3IyMDAwIiwiYSI6ImNtMjVndGNxYTBzMWkyam9oZzRkaGViaHkifQ.Qz8xkQt513SD8o7JRanfgA';

        //Instantiates the map
        const map = new mapboxgl.Map({
            container: 'mapbox', // container ID
            style: 'mapbox://styles/mapbox/dark-v8',
            center: [-98.35, 39.5], // starting position [lng, lat]. Note that lat must be set between -90 and 90
            zoom: 3, // starting zoom
            maxPitch: 0
        });

        //Once the map loads, sets up the map layer
        map.on('load', async () => {
            map.loadImage('../static/location-pin.png', (error, image) => {
                if (error) throw error;
                map.addImage('mapPin', image);
            });
            this.artist.drawDefaultPoints(map);
        });
        this.dataStore.set("map", map);

        //event listeners for point selection buttons
        document.getElementById("randomButton").addEventListener("click", this.generateRandomPoints);
        document.getElementById("resetToDefault").addEventListener("click", this.resetToDefaultPoints);
        document.getElementById("manualSelection").addEventListener("click", this.startManualSelection);

        //event listeners for algorithm controls
        document.getElementById("startAlgorithm").addEventListener("click", this.runAlgorithm);
    }

    async generateRandomPoints() {
        //Generates random points and sends them to the artist to draw them
        let points = this.generator.generatePoints(this.dataStore.get("map").getBounds());
        this.artist.drawRandomPoints(points, this.dataStore.get("map"));
    }

    async resetToDefaultPoints() {
        //Uses the artist to draw the default points
        this.artist.drawDefaultPoints(this.dataStore.get("map"));
    }

    async startManualSelection() {
        //Remove original event listener - this button should act as a toggle
        const button = document.getElementById("manualSelection");
        button.removeEventListener("click", this.startManualSelection);
        button.addEventListener("click", this.stopManualSelection);

        //Change the icon and disable the rest of the buttons
        button.innerHTML = "Toggled on";
        document.getElementById("randomButton").disabled = true;
        document.getElementById("resetToDefault").disabled = true;

        //Remove original source data and layer
        let map = this.dataStore.get("map");
        map.removeLayer("points");
        if (map.getSource('customPoints')) {
            map.removeSource('customPoints');
        }

        //Create new empty data source and remake the layer
        let data = { "type": "FeatureCollection", "features": [] };
        map.addSource('customPoints', { type: 'geojson', data: data });
        map.addLayer({
            id: 'points',
            type: 'symbol',
            source: 'customPoints',
            layout: {
                'icon-image': 'mapPin',
                'icon-size': .06,
                'icon-allow-overlap': true
            }
        });

        //Set up listener to draw points based on the lng/lat of the user's click
        map.on("click", this.manualClickEvent);
    }

    async stopManualSelection() {
        let map = this.dataStore.get("map");

        //Reset the event listeners
        const button = document.getElementById("manualSelection");
        button.removeEventListener("click", this.stopManualSelection);
        button.addEventListener("click", this.startManualSelection);

        //Change the icon back and enable the rest of the buttons
        button.innerHTML = "Toggled off";
        document.getElementById("randomButton").disabled = false;
        document.getElementById("resetToDefault").disabled = false;

        //Remove listener for map clicks
        map.off("click", this.manualClickEvent);
    }

    manualClickEvent(e) {
        this.artist.drawSinglePoint(e.lngLat, this.dataStore.get("map"));
    }

    async runAlgorithm() {
        //Halt any ongoing execution and disable "play" button from being used until the algorithm completes.
        document.getElementById("delay").terminate = true;
        document.getElementById("startAlgorithm").disabled = true;

        //Run the algorithm currently selected.
        const algorithm = document.getElementById("algSelection").value;
        switch(algorithm) {
            case "arbInsertion":
                await arbitraryInsertion(this.dataStore.get("map"));
                break;
        }

        //Re-enable "play" button
        document.getElementById("delay").terminate = false;
        document.getElementById("startAlgorithm").disabled = false;
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