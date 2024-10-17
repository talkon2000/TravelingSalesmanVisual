import BindingClass from "./utils/bindingClass.js";

export default class Artist extends BindingClass {

    constructor() {
        super();
        this.bindClassMethods(['drawPoints', 'removePoints', 'drawLines', 'removeLines'], this);
    }

    drawPoint(geoPoint, map) {

    }

    drawNewPoints(geoPoints, map) {
        this.removePoints();
        let displayPointArray = [];
        let drawLayer = document.getElementById("drawLayer");
        geoPoints.forEach(p => {
            let displayPoint = map.project(p);
            displayPointArray.push(displayPoint);
            let pointNode = document.createElement("img");
            pointNode.src = "./information.png";
            pointNode.classList.add("drawnPoint");
            pointNode.style.right = displayPoint.x + "px";
            pointNode.style.bottom = displayPoint.y + "px";
            pointNode.style.zIndex = "1";
            pointNode.style.height = "8px";
            drawLayer.append(pointNode);
        });
        return displayPointArray;
    }

    removePoints() {
        let drawLayer = document.getElementById("drawLayer");
        while (drawLayer.firstChild) {
            drawLayer.removeChild(drawLayer.firstChild);
        }
    }

    drawLines() {

    }

    removeLines() {

    }
}