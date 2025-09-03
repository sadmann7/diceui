import type { DocsLayoutProps } from "fumadocs-ui/layouts/docs";
import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";
import { CheckIcon } from "lucide-react";
import { Icons } from "@/components/icons";
import { Badge } from "@/components/ui/badge";
import { siteConfig } from "@/config/site";
import { source } from "@/lib/source";

export const baseOptions: BaseLayoutProps = {
  nav: {
    title: (
      <>
        <Icons.logo className="size-4" />
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
      icon: <Icons.gitHub className="size-4" />,
      external: true,
    },
  ],
};

export const docsOptions: DocsLayoutProps = {
  ...baseOptions,
  tree: source.pageTree,
  sidebar: {
    defaultOpenLevel: 1,
  },
};
