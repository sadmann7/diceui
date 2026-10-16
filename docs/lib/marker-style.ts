import { DEFAULT_STYLE } from "@/lib/constants";

// The style `cn-*` markers expand to, set by `StyleScope` while previews render.
let markerStyle = DEFAULT_STYLE;

export function getMarkerStyle() {
  return markerStyle;
}

export function setMarkerStyle(style: string) {
  markerStyle = style;
}
