import { createEngine, wrapClsx } from "cn/engine";
import tables from "cn/tables";

import { DEFAULT_STYLE } from "@/lib/constants";
import { getMarkerStyle } from "@/lib/marker-style";
import { STYLE_MAPS } from "@/registry/styles/__generated__/style-maps";

const engine = createEngine(tables);

type Cn = ReturnType<typeof wrapClsx>;

// `wrapClsx` caches by its arguments, so each style gets its own instance:
// one shared cache would keep returning the first style's classes.
const cnByStyle = new Map<string, Cn>();

function getStyleCn(style: string) {
  let styleCn = cnByStyle.get(style);
  if (!styleCn) {
    const styleMap = STYLE_MAPS[style] ?? STYLE_MAPS[DEFAULT_STYLE] ?? {};
    const expandMarkers = (input: string) =>
      input.includes("cn-")
        ? input.replace(/\bcn-[\w-]+/g, (marker) => styleMap[marker] ?? marker)
        : input;
    styleCn = wrapClsx((input) => engine.mergeString(expandMarkers(input)));
    cnByStyle.set(style, styleCn);
  }
  return styleCn;
}

const cn: Cn = (...inputs) => getStyleCn(getMarkerStyle())(...inputs);

export { cn };
