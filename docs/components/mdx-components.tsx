import type { Page } from "fumadocs-core/source";
import type { DocOut } from "fumadocs-mdx/runtime/next";
import { CodeBlock, Pre } from "fumadocs-ui/components/codeblock";
import { Heading } from "fumadocs-ui/components/heading";
import { Step, Steps } from "fumadocs-ui/components/steps";
import { Tab, Tabs } from "fumadocs-ui/components/tabs";
import defaultComponents from "fumadocs-ui/mdx";
import type { MDXComponents } from "mdx/types";
import dynamic from "next/dynamic";
import Link from "next/link";
import type * as React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Table, TableCell, TableHead, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

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
const Kbd = dynamic(() =>
  import("@/components/ui/kbd").then((mod) => ({ default: mod.Kbd })),
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
    table: ({ className, ...props }) => (
      <Table className={cn(className)} mdx {...props} />
    ),
    tr: TableRow,
    th: TableHead,
    td: TableCell,
    Tabs: ({ className, ...props }) => (
      <Tabs className={cn("rounded-md", className)} {...props} />
    ),
    Tab: ({ className, ...props }) => (
      <Tab className={cn("rounded-none", className)} {...props} />
    ),
    pre: ({ children, ...props }) => (
      <CodeBlock {...props}>
        <Pre>{children}</Pre>
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
    Kbd,
    ComponentTabs,
    ComponentSource,
    Steps,
    Step,
    AutoTypeTable,
    CSSVariablesTable,
    DataAttributesTable,
    PropsTable,
    KeyboardShortcutsTable,
  };
}

interface MdxProps {
  page: Page<DocOut>;
  components?: Partial<MDXComponents>;
}

export function Mdx({ page, components = {} }: MdxProps) {
  const Comp = page.data.body;
  const mdxComponents = useMdxComponents(components);

  return <Comp components={mdxComponents} />;
}
