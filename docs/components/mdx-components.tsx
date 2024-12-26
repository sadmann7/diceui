import { ComponentSource } from "@/components/component-source";
import { ComponentTabs } from "@/components/component-tabs";
import { DataAttributesTable } from "@/components/data-attributes-table";
import { Kbd } from "@/components/kbd";
import { KeyboardShortcutsTable } from "@/components/keyboard-shortcuts-table";
import { Table, TableCell, TableHead, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { createTypeTable } from "fumadocs-typescript/ui";
import { CodeBlock, Pre } from "fumadocs-ui/components/codeblock";
import { Heading } from "fumadocs-ui/components/heading";
import { Step, Steps } from "fumadocs-ui/components/steps";
import { Tab, Tabs } from "fumadocs-ui/components/tabs";
import defaultComponents from "fumadocs-ui/mdx";
import type { MDXComponents } from "mdx/types";
import { CSSVariablesTable } from "./css-variables-table";

const { AutoTypeTable } = createTypeTable();

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...defaultComponents,
    ...components,
    h1: (props) => <Heading as="h1" {...props} />,
    h2: (props) => <Heading as="h2" {...props} />,
    h3: (props) => <Heading as="h3" {...props} />,
    h4: (props) => <Heading as="h4" {...props} />,
    h5: (props) => <Heading as="h5" {...props} />,
    h6: (props) => <Heading as="h6" {...props} />,
    table: ({
      className,
      ...props
    }: React.HTMLAttributes<HTMLTableElement>) => (
      <Table className={cn(className)} mdx {...props} />
    ),
    tr: TableRow,
    th: TableHead,
    td: TableCell,
    Tabs: ({ className, ...props }: React.ComponentProps<typeof Tabs>) => (
      <Tabs className={cn("rounded-md", className)} {...props} />
    ),
    Tab,
    pre: ({ ...props }: React.ComponentProps<typeof Pre>) => (
      <CodeBlock {...props}>
        <Pre>{props.children}</Pre>
      </CodeBlock>
    ),
    kbd: ({ ...props }: React.HTMLAttributes<HTMLSpanElement>) => (
      <Kbd variant="outline" {...props} />
    ),
    ComponentTabs,
    ComponentSource,
    Steps,
    Step,
    AutoTypeTable: ({ path, name, type }) => (
      <div className="auto-type-table">
        <AutoTypeTable path={path} name={name} type={type} />
      </div>
    ),
    CSSVariablesTable,
    DataAttributesTable,
    KeyboardShortcutsTable,
  };
}
