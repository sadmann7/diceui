import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getIsExternalLink(link: string) {
  return link.startsWith("http") || link.startsWith("https");
}
