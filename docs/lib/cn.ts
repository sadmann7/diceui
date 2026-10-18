import { createEngine, twJoin, wrapClsx } from "cn/engine";
import tables from "cn/tables";

import { DEFAULT_STYLE } from "@/lib/constants";
import {
  getMarkerStyle,
  getRtlStyleMap,
  getStyleMap,
} from "@/lib/marker-style";

const engine = createEngine(tables);

type Cn = ReturnType<typeof wrapClsx>;

// `wrapClsx` caches by its arguments, so each style and direction gets its own
// instance: one shared cache would keep returning the first style's classes.
const cnByStyle = new Map<string, Cn>();

function getStyleCn(style: string, rtl: boolean) {
  const key = rtl ? `${style}:rtl` : style;
  let styleCn = cnByStyle.get(key);
  if (!styleCn) {
    const styleMap = getStyleMap(style) ?? {};
    const rtlStyleMap = (rtl && getRtlStyleMap(style)) || {};
    const expandMarkers = (input: string) =>
      input.includes("cn-")
        ? input.replace(
            /\bcn-[\w-]+/g,
            (marker) => rtlStyleMap[marker] ?? styleMap[marker] ?? marker,
          )
        : input;
    styleCn = wrapClsx((input) => engine.mergeString(expandMarkers(input)));
    cnByStyle.set(key, styleCn);
  }
  return styleCn;
}

function getLoadedStyle() {
  const style = getMarkerStyle();
  return getStyleMap(style) ? style : DEFAULT_STYLE;
}

// Until a style's map has loaded, markers expand to the default style.
const cn: Cn = (...inputs) => getStyleCn(getLoadedStyle(), false)(...inputs);

const cnRtl: Cn = (...inputs) => getStyleCn(getLoadedStyle(), true)(...inputs);

const twMerge = (...inputs: Parameters<typeof twJoin>) =>
  engine.mergeString(twJoin(...inputs));

export { cn, cnRtl, twMerge };
