import { Heading } from "fumadocs-ui/components/heading";
import defaultComponents from "fumadocs-ui/mdx";
import type { MDXComponents } from "mdx/types";

import { ComponentPreview } from "@/components/component-preview";
import { ComponentTabs } from "@/components/component-tabs";
import { Table, TableCell, TableHead, TableRow } from "@/components/ui/table";
import * as TabsPrimitive from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import type { NpmCommands } from "@/types/unist";
import { CodeBlock, Pre } from "fumadocs-ui/components/codeblock";
import { Tab, Tabs } from "fumadocs-ui/components/tabs";

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...defaultComponents,
    ...components,
    h1: (props) => (
      <Heading
        as="h1"
        {...props}
        className={cn(props.className, "font-heading")}
      />
    ),
    h2: (props) => (
      <Heading
        as="h2"
        {...props}
        className={cn(props.className, "font-heading")}
      />
    ),
    h3: (props) => (
      <Heading
        as="h3"
        {...props}
        className={cn(props.className, "font-heading")}
      />
    ),
    h4: (props) => (
      <Heading
        as="h4"
        {...props}
        className={cn(props.className, "font-heading")}
      />
    ),
    h5: (props) => (
      <Heading
        as="h5"
        {...props}
        className={cn(props.className, "font-heading")}
      />
    ),
    h6: (props) => (
      <Heading
        as="h6"
        {...props}
        className={cn(props.className, "font-heading")}
      />
    ),
    table: ({
      className,
      ...props
    }: React.HTMLAttributes<HTMLTableElement>) => (
      <Table className={cn("rounded-sm", className)} {...props} />
    ),
    tr: ({
      className,
      ...props
    }: React.HTMLAttributes<HTMLTableRowElement>) => (
      <TableRow
        className={cn("bg-transparent hover:bg-transparent", className)}
        {...props}
      />
    ),
    th: ({
      className,
      ...props
    }: React.HTMLAttributes<HTMLTableCellElement>) => (
      <TableHead className={cn("bg-accent/50", className)} {...props} />
    ),
    td: ({
      className,
      ...props
    }: React.HTMLAttributes<HTMLTableCellElement>) => <TableCell {...props} />,
    ShadcnTabs: ({
      className,
      ...props
    }: React.ComponentProps<typeof Tabs>) => (
      <TabsPrimitive.Tabs
        className={cn("relative mt-6 w-full", className)}
        {...props}
      />
    ),
    ShadcnTabsList: ({
      className,
      ...props
    }: React.ComponentProps<typeof TabsPrimitive.TabsList>) => (
      <TabsPrimitive.TabsList
        className={cn(
          "w-full justify-start rounded-none border-b bg-transparent p-0",
          className,
        )}
        {...props}
      />
    ),
    ShadcnTabsTrigger: ({
      className,
      ...props
    }: React.ComponentProps<typeof TabsPrimitive.TabsTrigger>) => (
      <TabsPrimitive.TabsTrigger
        className={cn(
          "relative h-9 rounded-none border-b-2 border-b-transparent bg-transparent px-4 pt-2 pb-3 font-semibold text-muted-foreground shadow-none transition-none data-[state=active]:border-b-primary data-[state=active]:text-foreground data-[state=active]:shadow-none",
          className,
        )}
        {...props}
      />
    ),
    ShadcnTabsContent: ({
      className,
      ...props
    }: React.ComponentProps<typeof TabsPrimitive.TabsContent>) => (
      <TabsPrimitive.TabsContent
        className={cn(
          "relative [&_h3.font-heading]:font-semibold [&_h3.font-heading]:text-base",
          className,
        )}
        {...props}
      />
    ),
    Tabs: ({ className, ...props }: React.ComponentProps<typeof Tabs>) => (
      <Tabs className={cn("rounded-sm", className)} {...props} />
    ),
    Tab,
    pre: ({
      npmCommand,
      ...props
    }: React.ComponentProps<typeof Pre> & {
      npmCommand?: Required<NpmCommands>;
    }) => (
      <CodeBlock {...props}>
        <Pre>{props.children}</Pre>
      </CodeBlock>
    ),
    code: ({ className, ...props }: React.HTMLAttributes<HTMLElement>) => (
      <code
        className={cn(
          "relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-xs",
          className,
        )}
        {...props}
      />
    ),
    ComponentPreview,
    ComponentTabs,
  };
}
