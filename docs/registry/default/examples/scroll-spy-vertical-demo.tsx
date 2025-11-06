"use client";

import * as React from "react";
import {
  ScrollSpy,
  ScrollSpyContent,
  ScrollSpyContentGroup,
  ScrollSpyItem,
  ScrollSpyItemGroup,
} from "@/registry/default/ui/scroll-spy";

export default function ScrollSpyVerticalDemo() {
  const [scrollContainer, setScrollContainer] =
    React.useState<HTMLDivElement | null>(null);

  return (
    <ScrollSpy
      offset={15}
      orientation="vertical"
      scrollContainer={scrollContainer}
      className="h-[400px] w-full border"
    >
      <ScrollSpyItemGroup className="border-b p-4">
        <ScrollSpyItem value="overview">Overview</ScrollSpyItem>
        <ScrollSpyItem value="features">Features</ScrollSpyItem>
        <ScrollSpyItem value="installation">Installation</ScrollSpyItem>
        <ScrollSpyItem value="examples">Examples</ScrollSpyItem>
        <ScrollSpyItem value="api">API</ScrollSpyItem>
      </ScrollSpyItemGroup>

      <ScrollSpyContentGroup
        ref={setScrollContainer}
        className="overflow-y-auto p-4"
      >
        <ScrollSpyContent value="overview" className="min-w-[400px]">
          <h2 className="font-bold text-2xl">Overview</h2>
          <p className="mt-2 text-muted-foreground">
            ScrollSpy with horizontal orientation for side-scrolling content.
          </p>
          <div className="mt-4 h-64 rounded-lg bg-accent" />
        </ScrollSpyContent>

        <ScrollSpyContent value="features" className="min-w-[400px]">
          <h2 className="font-bold text-2xl">Features</h2>
          <p className="mt-2 text-muted-foreground">
            All the features available in this component.
          </p>
          <div className="mt-4 h-64 rounded-lg bg-accent" />
        </ScrollSpyContent>

        <ScrollSpyContent value="installation" className="min-w-[400px]">
          <h2 className="font-bold text-2xl">Installation</h2>
          <p className="mt-2 text-muted-foreground">
            How to install and set up the component.
          </p>
          <div className="mt-4 h-64 rounded-lg bg-accent" />
        </ScrollSpyContent>

        <ScrollSpyContent value="examples" className="min-w-[400px]">
          <h2 className="font-bold text-2xl">Examples</h2>
          <p className="mt-2 text-muted-foreground">
            Various examples showing different use cases.
          </p>
          <div className="mt-4 h-64 rounded-lg bg-accent" />
        </ScrollSpyContent>

        <ScrollSpyContent value="api" className="min-w-[400px]">
          <h2 className="font-bold text-2xl">API Reference</h2>
          <p className="mt-2 text-muted-foreground">
            Complete API documentation for all components.
          </p>
          <div className="mt-4 h-64 rounded-lg bg-accent" />
        </ScrollSpyContent>
      </ScrollSpyContentGroup>
    </ScrollSpy>
  );
}
