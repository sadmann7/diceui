import { DEFAULT_STYLE } from "@/lib/constants";
import { STYLES } from "@/registry/styles";

export const STYLE_STORAGE_KEY = "diceui-style";
export const STYLE_NAMES = STYLES.map((style) => style.name);

export function getStyleScript() {
  return `try{var s=localStorage.getItem(${JSON.stringify(STYLE_STORAGE_KEY)});if(s&&${JSON.stringify(STYLE_NAMES)}.includes(s)){document.body.className=document.body.className.replace(/\\bstyle-[\\w-]+/,"style-"+s)}}catch(e){}`;
}

const listeners = new Set<() => void>();

export function getStyle() {
  const match = document.body.className.match(/\bstyle-([\w-]+)/);
  return match?.[1] ?? DEFAULT_STYLE;
}

export function getServerStyle() {
  return DEFAULT_STYLE;
}

export function setStyle(style: string) {
  document.body.classList.remove(...STYLE_NAMES.map((name) => `style-${name}`));
  document.body.classList.add(`style-${style}`);
  try {
    localStorage.setItem(STYLE_STORAGE_KEY, style);
  } catch {}
  for (const listener of listeners) listener();
}

export function subscribeStyle(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
