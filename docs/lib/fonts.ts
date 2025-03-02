import { Geist, Geist_Mono } from "next/font/google";

export const fontSans = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export async function loadFonts(): Promise<
  { name: string; data: Buffer; weight: 400 | 600; style: "normal" }[]
> {
  const [normal, mono, semibold] = await Promise.all([
    import("../assets/fonts/geist-regular-otf.json").then(
      (mod) => mod.default ?? mod,
    ),
    import("../assets/fonts/geistmono-regular-otf.json").then(
      (mod) => mod.default ?? mod,
    ),
    import("../assets/fonts/geist-semibold-otf.json").then(
      (mod) => mod.default ?? mod,
    ),
  ]);

  return [
    {
      name: "Geist",
      data: Buffer.from(normal.base64Font, "base64"),
      weight: 400 as const,
      style: "normal" as const,
    },
    {
      name: "Geist Mono",
      data: Buffer.from(mono.base64Font, "base64"),
      weight: 400 as const,
      style: "normal" as const,
    },
    {
      name: "Geist",
      data: Buffer.from(semibold.base64Font, "base64"),
      weight: 600 as const,
      style: "normal" as const,
    },
  ];
}
