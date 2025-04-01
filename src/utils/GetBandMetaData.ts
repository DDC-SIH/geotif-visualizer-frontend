import { GeoJSON } from "../../types/geojson";

export const GetBandMetaData = (geojson: GeoJSON) => {
  console.log(geojson);
  const metadata = geojson.properties.band_metadata.map(
    ([metadata]) => metadata
  );
  console.log(metadata);
  return metadata;
};
