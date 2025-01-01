import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";

import { Icons } from "@/components/icons";
import { siteConfig } from "@/config/site";
import { source } from "@/lib/source";
import type { DocsLayoutProps } from "fumadocs-ui/layouts/docs";

export const baseOptions: BaseLayoutProps = {
  nav: {
    title: (
      <>
        <Icons.logo className="size-4" aria-hidden="true" />
        <span className="font-medium [.uwu_&]:hidden [header_&]:text-[15px]">
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
    {
      type: "icon",
      url: siteConfig.links.github,
      text: "Github",
      icon: <Icons.gitHub className="size-4" aria-hidden="true" />,
      external: true,
    },
  ],
};

export const docsOptions: DocsLayoutProps = {
  ...baseOptions,
  tree: source.pageTree,
};
