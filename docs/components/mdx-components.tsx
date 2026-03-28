import type { InferPageType } from "fumadocs-core/source";
import { Callout } from "fumadocs-ui/components/callout";
import { Pre } from "fumadocs-ui/components/codeblock";
import { Heading } from "fumadocs-ui/components/heading";
import { Step, Steps } from "fumadocs-ui/components/steps";
import defaultComponents from "fumadocs-ui/mdx";
import type { MDXComponents } from "mdx/types";
import dynamic from "next/dynamic";
import Link from "next/link";
import type * as React from "react";
import { CodeBlock } from "@/components/code-block";
import { CodeTabs } from "@/components/code-tabs";
import {
  MdxTabsContent,
  MdxTabsList,
  MdxTabsTrigger,
} from "@/components/mdx-tabs";
import {
  PackageManagerTabs,
  PackageManagerTabsList,
} from "@/components/package-manager-tabs";
import type { source } from "@/lib/source";
import { cn } from "@/lib/utils";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/registry/bases/radix/ui/alert";
import { Kbd } from "@/registry/bases/radix/ui/kbd";
import {
  Table,
  TableCell,
  TableHead,
  TableRow,
} from "@/registry/bases/radix/ui/table";
import { Tabs } from "@/registry/bases/radix/ui/tabs";

const ComponentSource = dynamic(() =>
  import("@/components/component-source").then((mod) => ({
    default: mod.ComponentSource,
  })),
);

const ComponentTabs = dynamic(() =>
  import("@/components/component-tabs").then((mod) => ({
    default: mod.ComponentTabs,
  })),
);

const CSSVariablesTable = dynamic(() =>
  import("@/components/css-variables-table").then((mod) => ({
    default: mod.CSSVariablesTable,
  })),
);

const AutoTypeTable = dynamic(() =>
  import("@/components/auto-type-table").then((mod) => ({
    default: mod.AutoTypeTable,
  })),
);

const DataAttributesTable = dynamic(() =>
  import("@/components/data-attributes-table").then((mod) => ({
    default: mod.DataAttributesTable,
  })),
);

const PropsTable = dynamic(() =>
  import("@/components/props-table").then((mod) => ({
    default: mod.PropsTable,
  })),
);

const KeyboardShortcutsTable = dynamic(() =>
  import("@/components/keyboard-shortcuts-table").then((mod) => ({
    default: mod.KeyboardShortcutsTable,
  })),
);

const Components = dynamic(() =>
  import("@/components/components").then((mod) => ({
    default: mod.Components,
  })),
);

const Changelogs = dynamic(() =>
  import("@/components/changelogs").then((mod) => ({
    default: mod.Changelogs,
  })),
);

export function useMdxComponents(
  components: Partial<MDXComponents>,
): MDXComponents {
  const headings = Object.fromEntries(
    ["h1", "h2", "h3", "h4", "h5", "h6"].map((level) => [
      level,
      (props: React.ComponentProps<typeof Heading>) => (
        <Heading
          as={level as React.ComponentProps<typeof Heading>["as"]}
          {...props}
        />
      ),
    ]),
  );

  return {
    ...defaultComponents,
    ...components,
    ...headings,
    table: Table,
    tr: TableRow,
    th: TableHead,
    td: TableCell,
    pre: ({ children, ...props }: React.ComponentProps<typeof CodeBlock>) => (
      <CodeBlock {...props}>
        <Pre className="px-4">{children}</Pre>
      </CodeBlock>
    ),
    Link: ({ className, ...props }: React.ComponentProps<typeof Link>) => (
      <Link
        className={cn("underline underline-offset-4", className)}
        {...props}
      />
    ),
    Alert: ({ className, ...props }: React.ComponentProps<typeof Alert>) => (
      <Alert
        className={cn("not-prose my-2 bg-background", className)}
        {...props}
      />
    ),
    AlertTitle,
    AlertDescription,
    Tabs: ({ className, ...props }: React.ComponentProps<typeof Tabs>) => (
      <Tabs
        className={cn("not-prose relative mt-6 w-full", className)}
        {...props}
      />
    ),
    CodeBlockTabs: PackageManagerTabs,
    CodeBlockTabsList: PackageManagerTabsList,
    CodeBlockTabsTrigger: MdxTabsTrigger,
    CodeBlockTab: MdxTabsContent,
    CodeTabs,
    TabsList: MdxTabsList,
    TabsTrigger: MdxTabsTrigger,
    TabsContent: MdxTabsContent,
    Kbd: ({ className, ...props }: React.ComponentProps<typeof Kbd>) => (
      <Kbd className={cn("not-prose", className)} {...props} />
    ),
    Callout,
    ComponentTabs,
    ComponentSource,
    Steps,
    Step,
    AutoTypeTable,
    CSSVariablesTable,
    DataAttributesTable,
    PropsTable,
    KeyboardShortcutsTable,
    Components,
    Changelogs,
  };
}

interface MdxProps {
  page: InferPageType<typeof source>;
  components?: Partial<MDXComponents>;
}

export function Mdx({ page, components = {} }: MdxProps) {
  const Comp = page.data.body;
  const mdxComponents = useMdxComponents(components);

  return <Comp components={mdxComponents} />;
}
