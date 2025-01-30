import GeoJSONFeature from './GeoJSONFeature';

export default class FeatureCollection<T> implements GeoJSONFeature {
    readonly type: string;
    features: T[];

    constructor(features?: T[]) {
        this.type = "FeatureCollection";
        if (features === undefined) {
            this.features = [];
        } else {
            this.features = features;
        }
    }

    addFeature(feature: T): void {
        this.features.push(feature);
    }

    length(): number {
        return this.features.length;
    }

    getFeatures(): T[] {
        return this.features;
    }
}