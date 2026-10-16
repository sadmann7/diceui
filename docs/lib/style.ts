import { STYLES } from "@/registry/styles";

export const STYLE_STORAGE_KEY = "diceui-style";
export const STYLE_NAMES = STYLES.map((style) => style.name);

export function getStyleScript() {
  return `try{var s=localStorage.getItem(${JSON.stringify(STYLE_STORAGE_KEY)});if(s&&${JSON.stringify(STYLE_NAMES)}.includes(s)){document.body.className=document.body.className.replace(/\\bstyle-[\\w-]+/,"style-"+s)}}catch(e){}`;
}
