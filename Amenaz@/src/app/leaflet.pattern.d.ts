// in the global namesapce "L"
import * as L from 'leaflet';
import { Map, PathOptions } from 'leaflet';

declare module 'leaflet' {
  // there is a child namespace "vectorGrid"

  class Pattern {
    constructor(options?);
    addTo(map: Map): Pattern;
  }
  class StripePattern extends Pattern {
    constructor(options?);
  }
  interface PathOptions {
    fillPattern?: Pattern;
  }
}
