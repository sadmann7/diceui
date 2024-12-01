import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heading } from "fumadocs-ui/components/heading";
import defaultComponents from "fumadocs-ui/mdx";
import type { MDXComponents } from "mdx/types";

import { ComponentPreview } from "@/components/component-preview";
import { cn } from "@/lib/utils";

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
    Tabs: ({ className, ...props }: React.ComponentProps<typeof Tabs>) => (
      <Tabs className={cn("relative mt-6 w-full", className)} {...props} />
    ),
    TabsList: ({
      className,
      ...props
    }: React.ComponentProps<typeof TabsList>) => (
      <TabsList
        className={cn(
          "w-full justify-start rounded-none border-b bg-transparent p-0",
          className,
        )}
        {...props}
      />
    ),
    TabsTrigger: ({
      className,
      ...props
    }: React.ComponentProps<typeof TabsTrigger>) => (
      <TabsTrigger
        className={cn(
          "relative h-9 rounded-none border-b-2 border-b-transparent bg-transparent px-4 pt-2 pb-3 font-semibold text-muted-foreground shadow-none transition-none data-[state=active]:border-b-primary data-[state=active]:text-foreground data-[state=active]:shadow-none",
          className,
        )}
        {...props}
      />
    ),
    TabsContent: ({
      className,
      ...props
    }: React.ComponentProps<typeof TabsContent>) => (
      <TabsContent
        className={cn(
          "relative [&_h3.font-heading]:font-semibold [&_h3.font-heading]:text-base",
          className,
        )}
        {...props}
      />
    ),
    ComponentPreview,
  };
}
