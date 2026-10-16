import { createEngine, wrapClsx } from "cn/engine";
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

export { cn };
