import GeoJSONFeature from "./GeoJSONFeature";

export default class FeatureCollection implements GeoJSONFeature {
    readonly type: string;
    readonly features: GeoJSONFeature[];

    constructor(features?: GeoJSONFeature[]) {
        this.type = "FeatureCollection";
        if (features === undefined) {
            this.features = [];
        } else {
            this.features = features;
        }
    }
}