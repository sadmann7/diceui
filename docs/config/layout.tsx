import type { DocsLayoutProps } from "fumadocs-ui/layouts/docs";
import type { BaseLayoutProps, LinkItemType } from "fumadocs-ui/layouts/shared";
import { Icons } from "@/components/icons";
import { siteConfig } from "@/config/site";
import { source } from "@/lib/source";

const githubLink: LinkItemType = {
  type: "icon",
  url: siteConfig.links.github,
  text: "Github",
  icon: <Icons.gitHub className="size-4" />,
  external: true,
};

export const baseOptions: BaseLayoutProps = {
  nav: {
    title: (
      <>
        <Icons.logo className="size-4" />
        <span className="in-[.uwu]:hidden font-medium in-[header]:text-[15px]">
          {siteConfig.name}
        </span>
      </>
    ),
  },
  links: [
    {
      text: "Docs",
      url: "/docs",
    },
    githubLink,
  ],
};

export const docsOptions: DocsLayoutProps = {
  ...baseOptions,
  tree: source.pageTree,
  sidebar: { defaultOpenLevel: 1 },
  links: [githubLink],
};
