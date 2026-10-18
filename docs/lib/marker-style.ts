import { DEFAULT_STYLE } from "@/lib/constants";
import {
  defaultRtlStyleMap,
  defaultStyleMap,
  styleMapLoaders,
} from "@/registry/styles/__generated__/style-map-loaders";

type StyleMap = Record<string, string>;

// The default style ships with the page; the others load when selected.
const styleMaps = new Map<string, StyleMap>([[DEFAULT_STYLE, defaultStyleMap]]);
// Only the markers whose classes change in RTL.
const rtlStyleMaps = new Map<string, StyleMap>([
  [DEFAULT_STYLE, defaultRtlStyleMap],
]);
const pending = new Map<string, Promise<void>>();

let markerStyle = DEFAULT_STYLE;

export function getMarkerStyle() {
  return markerStyle;
}

export function setMarkerStyle(style: string) {
  markerStyle = style;
}

export function getStyleMap(style: string) {
  return styleMaps.get(style);
}

export function getRtlStyleMap(style: string) {
  return rtlStyleMaps.get(style);
}

export function loadStyleMap(style: string) {
  if (styleMaps.has(style)) return Promise.resolve();
  const loader = styleMapLoaders[style];
  if (!loader) return Promise.resolve();

  let promise = pending.get(style);
  if (!promise) {
    promise = loader().then((module) => {
      styleMaps.set(style, module.default);
      rtlStyleMaps.set(style, module.rtlStyleMap);
    });
    pending.set(style, promise);
  }
  return promise;
}
