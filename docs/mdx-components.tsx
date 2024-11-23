import { Heading } from "fumadocs-ui/components/heading";
import defaultComponents from "fumadocs-ui/mdx";
import type { MDXComponents } from "mdx/types";

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
  };
}
