import { clsx, createEngine, twJoin, wrapClsx } from "cn/engine";
import tables from "cn/tables";

import { DEFAULT_STYLE } from "@/lib/constants";
import { STYLE_MAPS } from "@/registry/styles/__generated__/style-maps";

const engine = createEngine(tables);
const styleMap = STYLE_MAPS[DEFAULT_STYLE] ?? {};

function expandMarkers(input: string) {
  return input.includes("cn-")
    ? input.replace(/\bcn-[\w-]+/g, (marker) => styleMap[marker] ?? marker)
    : input;
}

const cn = wrapClsx(
  (input) => engine.mergeString(expandMarkers(input)),
  engine,
);
const twMerge = engine.merge;

export { clsx, cn, createEngine, twJoin, twMerge };
