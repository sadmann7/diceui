import {
  ScrollSpy,
  ScrollSpyContent,
  ScrollSpyContentGroup,
  ScrollSpyItem,
  ScrollSpyItemGroup,
} from "@/registry/default/ui/scrollspy";

export default function ScrollSpyDemo() {
  return (
    <ScrollSpy>
      <ScrollSpyItemGroup className="sticky top-20 h-fit">
        <ScrollSpyItem value="introduction">Introduction</ScrollSpyItem>
        <ScrollSpyItem value="getting-started">Getting Started</ScrollSpyItem>
        <ScrollSpyItem value="usage">Usage</ScrollSpyItem>
        <ScrollSpyItem value="api-reference">API Reference</ScrollSpyItem>
      </ScrollSpyItemGroup>
      <ScrollSpyContentGroup>
        <ScrollSpyContent value="introduction">
          <h2 className="font-bold text-2xl">Introduction</h2>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            ScrollSpy automatically updates navigation links based on scroll
            position.
          </p>
          <div className="mt-4 h-64 rounded-lg bg-zinc-100 dark:bg-zinc-800" />
        </ScrollSpyContent>
        <ScrollSpyContent value="getting-started">
          <h2 className="font-bold text-2xl">Getting Started</h2>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            Install the component using the CLI or copy the source code.
          </p>
          <div className="mt-4 h-64 rounded-lg bg-zinc-100 dark:bg-zinc-800" />
        </ScrollSpyContent>
        <ScrollSpyContent value="usage">
          <h2 className="font-bold text-2xl">Usage</h2>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            Use the Provider, Root, Item, and Content components to create your
            scrollspy navigation.
          </p>
          <div className="mt-4 h-64 rounded-lg bg-zinc-100 dark:bg-zinc-800" />
        </ScrollSpyContent>
        <ScrollSpyContent value="api-reference">
          <h2 className="font-bold text-2xl">API Reference</h2>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            Complete API documentation for all ScrollSpy components.
          </p>
          <div className="mt-4 h-64 rounded-lg bg-zinc-100 dark:bg-zinc-800" />
        </ScrollSpyContent>
      </ScrollSpyContentGroup>
    </ScrollSpy>
  );
}
