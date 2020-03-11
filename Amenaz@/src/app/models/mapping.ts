import { LatLngExpression, Marker, GeoJSON } from 'leaflet';

export type LayerType = {
  id: number;
  layerName: string;
  queryName: string;
  threadType: string[];
  gJSON: GeoJSON;
  color: string;
  downloaded: boolean;
  description: string;
  datum: string;
  type: string;
  fixed?: boolean;
};

export type City = {
  id: number;
  name: string;
  location: LatLngExpression;
  marker: Marker;
  zoomLevel: any;
  layers: LayerType[];
  schemaName: string;
};

export interface DBCity {
  id: number;
  nombre: string;
  esquema: string;
  latitud: number;
  longitud: number;
  zoom?: number;
}
