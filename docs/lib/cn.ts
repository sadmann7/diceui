import { createEngine, wrapClsx } from "cn/engine";
import tables from "cn/tables";

import { DEFAULT_STYLE } from "@/lib/constants";
import { getMarkerStyle } from "@/lib/marker-style";
import { STYLE_MAPS } from "@/registry/styles/__generated__/style-maps";

const engine = createEngine(tables);

function expandMarkers(input: string) {
  if (!input.includes("cn-")) return input;
  const styleMap =
    STYLE_MAPS[getMarkerStyle()] ?? STYLE_MAPS[DEFAULT_STYLE] ?? {};
  return input.replace(/\bcn-[\w-]+/g, (marker) => styleMap[marker] ?? marker);
}

const cn = wrapClsx(
  (input) => engine.mergeString(expandMarkers(input)),
  engine,
);

export { cn };
