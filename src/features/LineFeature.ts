import GeoJSONFeature from './GeoJSONFeature.ts';
export default class LineFeature implements GeoJSONFeature {
    readonly type: string = "Feature";
    geometry: {
        readonly type: string;
        readonly coordinates: [number[], number[]];
    };

    constructor(lnglat1: number[], lnglat2: number[]) {
        this.geometry = {
            type: "LineString",
            coordinates: [lnglat1, lnglat2]
        };
    }
}