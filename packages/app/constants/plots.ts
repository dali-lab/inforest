import { Plot } from "@ong-forestry/schema";
import { LatLng } from "react-native-maps";
import * as utm from "utm";

export const getPlotCorners = (plot: Plot): LatLng[] => {
  const { easting, northing, zoneNum, zoneLetter } = utm.fromLatLon(
    plot.latitude,
    plot.longitude
  );
  return [
    utm.toLatLon(easting, northing, zoneNum, zoneLetter),
    utm.toLatLon(easting + 20, northing, zoneNum, zoneLetter),
    utm.toLatLon(easting + 20, northing - 20, zoneNum, zoneLetter),
    utm.toLatLon(easting, northing - 20, zoneNum, zoneLetter),
  ];
};

export const formPlotNumber = (i: number, j: number) =>
  `${j >= 10 ? j : `0${j}`}${i >= 10 ? i : `0${i}`}`;

export const parsePlotNumber = (plotNumber: string) => ({
  i: parseInt(plotNumber.substring(2, 4)),
  j: parseInt(plotNumber.substring(0, 2)),
});
