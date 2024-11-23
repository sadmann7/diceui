import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import localFont from "next/font/local";

export const fontSans = GeistSans;
export const fontMono = GeistMono;

export const fontHeading = localFont({
  src: "./../assets/fonts/calsans.ttf",
  variable: "--font-heading",
});
