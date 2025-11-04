"use client";

import * as React from "react";
import {
  ScrollSpy,
  ScrollSpyContent,
  ScrollSpyContentGroup,
  ScrollSpyItem,
  ScrollSpyItemGroup,
} from "@/registry/default/ui/scrollspy";

export default function ScrollSpyScrollContainerDemo() {
  const [scrollContainer, setScrollContainer] =
    React.useState<HTMLDivElement | null>(null);

  return (
    <ScrollSpy
      offset={20}
      scrollContainer={scrollContainer}
      className="h-[600px] border"
    >
      <ScrollSpyItemGroup className="w-48 border-r p-4">
        <ScrollSpyItem value="overview">Overview</ScrollSpyItem>
        <ScrollSpyItem value="features">Features</ScrollSpyItem>
        <ScrollSpyItem value="installation">Installation</ScrollSpyItem>
        <ScrollSpyItem value="examples">Examples</ScrollSpyItem>
        <ScrollSpyItem value="api">API</ScrollSpyItem>
      </ScrollSpyItemGroup>

      <ScrollSpyContentGroup
        ref={setScrollContainer}
        className="flex-1 overflow-y-auto p-6"
      >
        <ScrollSpyContent value="overview">
          <h2 className="font-bold text-2xl">Overview</h2>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            ScrollSpy with a scrollable container instead of window scroll.
          </p>
          <div className="mt-4 h-96 rounded-lg bg-zinc-100 dark:bg-zinc-800" />
        </ScrollSpyContent>

        <ScrollSpyContent value="features">
          <h2 className="font-bold text-2xl">Features</h2>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            All the features available in this component.
          </p>
          <div className="mt-4 h-96 rounded-lg bg-zinc-100 dark:bg-zinc-800" />
        </ScrollSpyContent>

        <ScrollSpyContent value="installation">
          <h2 className="font-bold text-2xl">Installation</h2>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            How to install and set up the component.
          </p>
          <div className="mt-4 h-96 rounded-lg bg-zinc-100 dark:bg-zinc-800" />
        </ScrollSpyContent>

        <ScrollSpyContent value="examples">
          <h2 className="font-bold text-2xl">Examples</h2>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            Various examples showing different use cases.
          </p>
          <div className="mt-4 h-96 rounded-lg bg-zinc-100 dark:bg-zinc-800" />
        </ScrollSpyContent>

        <ScrollSpyContent value="api">
          <h2 className="font-bold text-2xl">API Reference</h2>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            Complete API documentation for all components.
          </p>
          <div className="mt-4 h-96 rounded-lg bg-zinc-100 dark:bg-zinc-800" />
        </ScrollSpyContent>
      </ScrollSpyContentGroup>
    </ScrollSpy>
  );
}
