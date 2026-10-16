import { createEngine, wrapClsx } from "cn/engine";
import tables from "cn/tables";

import { DEFAULT_STYLE } from "@/lib/constants";
import { getMarkerStyle, getStyleMap } from "@/lib/marker-style";

const engine = createEngine(tables);

type Cn = ReturnType<typeof wrapClsx>;

// `wrapClsx` caches by its arguments, so each style gets its own instance:
// one shared cache would keep returning the first style's classes.
const cnByStyle = new Map<string, Cn>();

function getStyleCn(style: string) {
  let styleCn = cnByStyle.get(style);
  if (!styleCn) {
    const styleMap = getStyleMap(style) ?? {};
    const expandMarkers = (input: string) =>
      input.includes("cn-")
        ? input.replace(/\bcn-[\w-]+/g, (marker) => styleMap[marker] ?? marker)
        : input;
    styleCn = wrapClsx((input) => engine.mergeString(expandMarkers(input)));
    cnByStyle.set(style, styleCn);
  }
  return styleCn;
}

// Until a style's map has loaded, markers expand to the default style.
const cn: Cn = (...inputs) => {
  const style = getMarkerStyle();
  return getStyleCn(getStyleMap(style) ? style : DEFAULT_STYLE)(...inputs);
};

export { cn };
