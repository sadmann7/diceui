import { twMerge } from "tailwind-merge";

export function cn(...inputs: string[]) {
  return twMerge(inputs);
}
