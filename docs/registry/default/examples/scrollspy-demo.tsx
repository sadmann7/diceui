import * as ScrollSpy from "@/registry/default/ui/scrollspy";

export default function ScrollSpyDemo() {
  return (
    <ScrollSpy.Root className="flex gap-8">
      <nav className="sticky top-20 h-fit w-48">
        <div className="flex flex-col gap-2">
          <ScrollSpy.Item
            value="introduction"
            className="rounded px-3 py-1.5 text-sm text-zinc-600 transition-colors hover:bg-zinc-100 data-active:bg-zinc-100 data-active:font-medium data-active:text-zinc-900 dark:text-zinc-400 dark:data-active:bg-zinc-800 dark:data-active:text-zinc-50 dark:hover:bg-zinc-800"
          >
            Introduction
          </ScrollSpy.Item>
          <ScrollSpy.Item
            value="getting-started"
            className="rounded px-3 py-1.5 text-sm text-zinc-600 transition-colors hover:bg-zinc-100 data-active:bg-zinc-100 data-active:font-medium data-active:text-zinc-900 dark:text-zinc-400 dark:data-active:bg-zinc-800 dark:data-active:text-zinc-50 dark:hover:bg-zinc-800"
          >
            Getting Started
          </ScrollSpy.Item>
          <ScrollSpy.Item
            value="usage"
            className="rounded px-3 py-1.5 text-sm text-zinc-600 transition-colors hover:bg-zinc-100 data-active:bg-zinc-100 data-active:font-medium data-active:text-zinc-900 dark:text-zinc-400 dark:data-active:bg-zinc-800 dark:data-active:text-zinc-50 dark:hover:bg-zinc-800"
          >
            Usage
          </ScrollSpy.Item>
          <ScrollSpy.Item
            value="api-reference"
            className="rounded px-3 py-1.5 text-sm text-zinc-600 transition-colors hover:bg-zinc-100 data-active:bg-zinc-100 data-active:font-medium data-active:text-zinc-900 dark:text-zinc-400 dark:data-active:bg-zinc-800 dark:data-active:text-zinc-50 dark:hover:bg-zinc-800"
          >
            API Reference
          </ScrollSpy.Item>
        </div>
      </nav>

      <div className="flex-1 space-y-8">
        <ScrollSpy.Content id="introduction">
          <h2 className="font-bold text-2xl">Introduction</h2>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            ScrollSpy automatically updates navigation links based on scroll
            position.
          </p>
          <div className="mt-4 h-64 rounded-lg bg-zinc-100 dark:bg-zinc-800" />
        </ScrollSpy.Content>

        <ScrollSpy.Content id="getting-started">
          <h2 className="font-bold text-2xl">Getting Started</h2>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            Install the component using the CLI or copy the source code.
          </p>
          <div className="mt-4 h-64 rounded-lg bg-zinc-100 dark:bg-zinc-800" />
        </ScrollSpy.Content>

        <ScrollSpy.Content id="usage">
          <h2 className="font-bold text-2xl">Usage</h2>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            Use the Provider, Root, Item, and Content components to create your
            scrollspy navigation.
          </p>
          <div className="mt-4 h-64 rounded-lg bg-zinc-100 dark:bg-zinc-800" />
        </ScrollSpy.Content>

        <ScrollSpy.Content id="api-reference">
          <h2 className="font-bold text-2xl">API Reference</h2>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            Complete API documentation for all ScrollSpy components.
          </p>
          <div className="mt-4 h-64 rounded-lg bg-zinc-100 dark:bg-zinc-800" />
        </ScrollSpy.Content>
      </div>
    </ScrollSpy.Root>
  );
}
