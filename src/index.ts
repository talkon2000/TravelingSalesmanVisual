import BindingClass from './utils/BindingClass.ts';
import 'https://api.mapbox.com/mapbox-gl-js/v3.7.0/mapbox-gl.js';
import Artist from './utils/Artist.ts';
import ArbitraryInsertionAlgorithm from './algorithms/construction/ArbitraryInsertion.ts';
import LoopTimer from './utils/LoopTimer.ts';

export default class Page extends BindingClass {

    private map!: mapboxgl.Map;
    private timer: LoopTimer | undefined;

    constructor() {
        super();
        this.bindClassMethods(['mount', 'generateRandomPoints', 'resetToDefaultPoints',
                'startManualSelection', 'stopManualSelection', 'manualClickEvent', 'runAlgorithm', 'skipAlgorithm', 'stopAlgorithm'], this);
        this.mount();
    }

    /**
     * Add the map to the page and set up event listeners for button.
     */
    private async mount() {
        //not secret access
        (mapboxgl as any).accessToken = 'pk.eyJ1Ijoiam9zaG10YXlsb3IyMDAwIiwiYSI6ImNtMjVndGNxYTBzMWkyam9oZzRkaGViaHkifQ.Qz8xkQt513SD8o7JRanfgA';

        //Instantiates the map
        const map = new mapboxgl.Map({
            container: 'mapbox', // container ID
            style: 'mapbox://styles/mapbox/dark-v8',
            center: [-98.35, 39.5], // starting position [lng, lat]. Note that lat must be set between -90 and 90
            zoom: 3, // starting zoom
            maxPitch: 0
        });

        //Once the map loads, sets up the map with sources, layers, and points
        map.on('load', async () => {
            await Artist.setupMap(map);
        });
        this.map = map;

        //event listeners for point selection buttons
        document.getElementById("randomButton")?.addEventListener("click", this.generateRandomPoints);
        document.getElementById("resetToDefault")?.addEventListener("click", this.resetToDefaultPoints);
        document.getElementById("manualSelection")?.addEventListener("click", this.startManualSelection);

        //event listeners for algorithm controls
        document.getElementById("startAlgorithm")?.addEventListener("click", this.runAlgorithm);
        document.getElementById("skipAlgorithm")?.addEventListener("click", this.skipAlgorithm);
        document.getElementById("stopAlgorithm")?.addEventListener("click", this.stopAlgorithm);
        const slider = document.getElementById("delay");
        slider?.addEventListener('input', () => {
            this.timer?.setInterval(+(slider as HTMLInputElement).value);
        });
    }

    /**
     * Clears the map and generates random points on the map
     */
    private generateRandomPoints() {
        Artist.drawRandomPoints(this.map, +(document.getElementById("numRandomPoints") as HTMLInputElement)?.value);
    }

    /**
     * Clears the map and draws the predefined default points on the map
     */
    private resetToDefaultPoints() {
        Artist.drawDefaultPoints(this.map);
    }

    /**
     * Toggles the state of the map and controls to enable manually selecting points on the map
     */
    private startManualSelection() {
        //Remove original event listener - this button should act as a toggle
        const manualButton: HTMLElement | null = document.getElementById("manualSelection");
        if (manualButton === null) {
            throw "Could not find button to toggle manual selection, ID: manualSelection";
        }
        manualButton.removeEventListener("click", this.startManualSelection);
        manualButton.addEventListener("click", this.stopManualSelection);

        //Change the icon and disable the rest of the buttons
        manualButton.innerHTML = "Toggled on";
        (document.getElementById("randomButton") as HTMLInputElement).disabled = true;
        (document.getElementById("resetToDefault") as HTMLInputElement).disabled = true;

        //Remove lines and points on the map
        Artist.clearAllLines(this.map);
        Artist.clearPoints(this.map);

        //Set up listener to draw points based on the lng/lat of the user's click
        this.map.on("click", this.manualClickEvent);
    }

    /**
     * Toggles the state of the map and controls to disable manually selecting points on the map and returns the application to normal function
     */
    private stopManualSelection() {
        //Reset the event listeners
        const manualButton: HTMLElement | null = document.getElementById("manualSelection");
        if (manualButton === null) {
            throw "Could not find button to toggle manual selection, ID: manualSelection";
        }
        manualButton.removeEventListener("click", this.stopManualSelection);
        manualButton.addEventListener("click", this.startManualSelection);

        //Change the icon back and enable the rest of the buttons
        manualButton.innerHTML = "Toggled off";
        (document.getElementById("randomButton") as HTMLInputElement).disabled = false;
        (document.getElementById("resetToDefault") as HTMLInputElement).disabled = false;

        //Remove listener for map clicks
        this.map.off("click", this.manualClickEvent);
    }

    private manualClickEvent(e: mapboxgl.MapMouseEvent) {
        Artist.drawSinglePoint(e.lngLat, this.map);
    }

    private runAlgorithm() {
        //Halt any ongoing execution and disable "play" button from being used until the algorithm completes.
        (document.getElementById("startAlgorithm") as HTMLInputElement).disabled = true;

        //Run the algorithm currently selected.
        const algorithm: string = (document.getElementById("algorithmDropdown") as HTMLInputElement).value;
        switch(algorithm) {
            case "arbInsertion":
                //await arbitraryInsertion(this.dataStore.get("map"));
                let arbInsertion = new ArbitraryInsertionAlgorithm(this.map);
                let delay = +(document.getElementById("delay") as HTMLInputElement)?.value;
                this.timer = new LoopTimer(arbInsertion.run.bind(arbInsertion), delay);
                this.timer.start();
                break;
        }

        //Re-enable "play" button
        (document.getElementById("delay") as HTMLInputElement).disabled = false;
        (document.getElementById("startAlgorithm") as HTMLInputElement).disabled = false;
    }

    private skipAlgorithm() {
        //Manually sets delay of LoopTimer to 0
        this.timer?.setInterval(0);
    }

    private stopAlgorithm() {
        //Halt any ongoing execution
        this.timer?.stop();
        //Clear the map of lines
        Artist.clearAllLines(this.map);
    }
}

/**
 * Main method to run when the page contents have loaded.
 */
const main = async () => {
    const page = new Page();
}


window.addEventListener('DOMContentLoaded', main);