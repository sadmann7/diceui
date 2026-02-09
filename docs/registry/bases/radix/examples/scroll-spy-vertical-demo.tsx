"use client";

import * as React from "react";
import {
  ScrollSpy,
  ScrollSpyLink,
  ScrollSpyNav,
  ScrollSpySection,
  ScrollSpyViewport,
} from "@/registry/bases/radix/ui/scroll-spy";

export default function ScrollSpyVerticalDemo() {
  const [scrollContainer, setScrollContainer] =
    React.useState<HTMLDivElement | null>(null);

  return (
    <ScrollSpy
      offset={10}
      orientation="vertical"
      scrollContainer={scrollContainer}
      className="h-[400px] w-full border"
    >
      <ScrollSpyNav className="border-b p-4">
        <ScrollSpyLink value="overview">Overview</ScrollSpyLink>
        <ScrollSpyLink value="features">Features</ScrollSpyLink>
        <ScrollSpyLink value="installation">Installation</ScrollSpyLink>
        <ScrollSpyLink value="examples">Examples</ScrollSpyLink>
        <ScrollSpyLink value="api">API</ScrollSpyLink>
      </ScrollSpyNav>

      <ScrollSpyViewport
        ref={setScrollContainer}
        className="overflow-y-auto p-4"
      >
        <ScrollSpySection value="overview" className="min-w-[400px]">
          <h2 className="font-bold text-2xl">Overview</h2>
          <p className="mt-2 text-muted-foreground">
            ScrollSpy with horizontal orientation for side-scrolling content.
          </p>
          <div className="mt-4 h-64 rounded-lg bg-accent" />
        </ScrollSpySection>

        <ScrollSpySection value="features" className="min-w-[400px]">
          <h2 className="font-bold text-2xl">Features</h2>
          <p className="mt-2 text-muted-foreground">
            All the features available in this component.
          </p>
          <div className="mt-4 h-64 rounded-lg bg-accent" />
        </ScrollSpySection>

        <ScrollSpySection value="installation" className="min-w-[400px]">
          <h2 className="font-bold text-2xl">Installation</h2>
          <p className="mt-2 text-muted-foreground">
            How to install and set up the component.
          </p>
          <div className="mt-4 h-64 rounded-lg bg-accent" />
        </ScrollSpySection>

        <ScrollSpySection value="examples" className="min-w-[400px]">
          <h2 className="font-bold text-2xl">Examples</h2>
          <p className="mt-2 text-muted-foreground">
            Various examples showing different use cases.
          </p>
          <div className="mt-4 h-64 rounded-lg bg-accent" />
        </ScrollSpySection>

        <ScrollSpySection value="api" className="min-w-[400px]">
          <h2 className="font-bold text-2xl">API Reference</h2>
          <p className="mt-2 text-muted-foreground">
            Complete API documentation for all components.
          </p>
          <div className="mt-4 h-64 rounded-lg bg-accent" />
        </ScrollSpySection>
      </ScrollSpyViewport>
    </ScrollSpy>
  );
}
