import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Dice UI",
    short_name: "Dice UI",
    description: "Unstyled ui component library.",
    start_url: "/",
    display: "standalone",
    background_color: "#fff",
    theme_color: "#fff",
    icons: [
      {
        src: "/icon?png",
        sizes: "32x32",
        type: "image/png",
      },
    ],
  };
}
