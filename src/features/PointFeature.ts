import GeoJSONFeature from './GeoJSONFeature.ts';
export default class PointFeature implements GeoJSONFeature {
    readonly type: string = "Feature";
    geometry: {
        readonly type: string;
        coordinates: number[];
    };

    constructor(lng: number, lat: number) {
        this.geometry = {
            type: "Point",
            coordinates: [lng, lat]
        };
    }

    getLngLat(): number[] {
        return [this.geometry.coordinates[0], this.geometry.coordinates[1]];
    }
}