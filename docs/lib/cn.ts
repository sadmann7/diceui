import { clsx, createEngine, twJoin, wrapClsx } from "cn/engine";
import tables from "cn/tables";

import { MARKER_CLASSES } from "@/registry/styles/__generated__/style-maps";

const engine = createEngine(tables);

function expandMarkers(input: string) {
  return input.includes("cn-")
    ? input.replace(
        /\bcn-[\w-]+/g,
        (marker) => MARKER_CLASSES[marker] ?? marker,
      )
    : input;
}

const cn = wrapClsx(
  (input) => engine.mergeString(expandMarkers(input)),
  engine,
);
const twMerge = engine.merge;

export { clsx, cn, createEngine, twJoin, twMerge };
