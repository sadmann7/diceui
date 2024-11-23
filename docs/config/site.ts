import type { LinkItemType } from "fumadocs-ui/layouts/links";

export const siteConfig = {
  name: "Dice UI",
  description:
    "Dice UI is a simple and modern ui library for your next project",
  url: "https://diceui.com",
  ogImage: "https://diceui.com/opengraph-image.png",
  links: {
    twitter: "https://x.com/sadmann7",
    github: "https://github.com/sadmann7/diceui",
  },
  mainNav: [
    {
      text: "Docs",
      url: "/docs",
    },
  ] satisfies LinkItemType[],
};
