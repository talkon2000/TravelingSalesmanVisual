import BindingClass from './utils/bindingClass.js';
import DataStore from './utils/dataStore.js';
import 'https://api.mapbox.com/mapbox-gl-js/v3.7.0/mapbox-gl.js';
import Generator from './generation.js';
import Artist from './drawOnMap.js';
import { ArbitraryInsertionAlgorithm } from './algorithms/construction/arbitraryInsertion.js';
import { LoopTimer } from './utils/LoopTimer.js';

export default class Page extends BindingClass {

    constructor() {
            super();
            this.bindClassMethods(['mount', 'generateRandomPoints', 'resetToDefaultPoints',
                 'startManualSelection', 'stopManualSelection', 'manualClickEvent', 'runAlgorithm', 'skipAlgorithm', 'stopAlgorithm'], this);
            this.dataStore = new DataStore();
            this.generator = new Generator();
            this.artist = new Artist();
            this.timer = new LoopTimer();
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
        document.getElementById("skipAlgorithm").addEventListener("click", this.skipAlgorithm);
        document.getElementById("stopAlgorithm").addEventListener("click", this.stopAlgorithm);
        const slider = document.getElementById("delay");
        slider.addEventListener('input', () => {
            this.timer.setInterval(slider.value);
        });

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
        document.getElementById("startAlgorithm").disabled = true;

        //Run the algorithm currently selected.
        const algorithm = document.getElementById("algorithmDropdown").value;
        switch(algorithm) {
            case "arbInsertion":
                //await arbitraryInsertion(this.dataStore.get("map"));
                let arbInsertion = new ArbitraryInsertionAlgorithm(this.artist, this.dataStore.get("map"));
                this.timer = new LoopTimer(arbInsertion.run.bind(arbInsertion), document.getElementById("delay").value);
                this.timer.start();
                break;
        }

        //Re-enable "play" button
        document.getElementById("delay").disabled = false;
        document.getElementById("startAlgorithm").disabled = false;
    }

    skipAlgorithm() {
        //Manually sets delay of LoopTimer to 0
        this.timer.setInterval(0);
    }

    stopAlgorithm() {
        //Halt any ongoing execution
        if (this.timer != null) {
            this.timer.stop();
        }

        //Reset lines
        if (this.dataStore.get("map").getSource("lines")) {
            this.dataStore.get("map").getSource("lines").setData({ "type": "FeatureCollection", "features": [] });
        }
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