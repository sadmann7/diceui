import {
  ScrollSpy,
  ScrollSpyContent,
  ScrollSpyItem,
  ScrollSpyList,
} from "@/registry/default/ui/scrollspy";

export default function ScrollSpyNestedDemo() {
  return (
    <ScrollSpy className="flex gap-8">
      <ScrollSpyList className="sticky top-20 h-fit w-56">
        <div className="flex flex-col gap-1">
          <ScrollSpyItem
            value="overview"
            className="rounded px-3 py-1.5 text-sm text-zinc-600 transition-colors hover:bg-zinc-100 data-active:bg-zinc-100 data-active:font-medium data-active:text-zinc-900 dark:text-zinc-400 dark:data-active:bg-zinc-800 dark:data-active:text-zinc-50 dark:hover:bg-zinc-800"
          >
            Overview
          </ScrollSpyItem>
          <div className="ml-4 flex flex-col gap-1">
            <ScrollSpyItem
              value="overview-features"
              className="rounded px-3 py-1.5 text-sm text-zinc-600 transition-colors hover:bg-zinc-100 data-active:bg-zinc-100 data-active:font-medium data-active:text-zinc-900 dark:text-zinc-400 dark:data-active:bg-zinc-800 dark:data-active:text-zinc-50 dark:hover:bg-zinc-800"
            >
              Features
            </ScrollSpyItem>
            <ScrollSpyItem
              value="overview-benefits"
              className="rounded px-3 py-1.5 text-sm text-zinc-600 transition-colors hover:bg-zinc-100 data-active:bg-zinc-100 data-active:font-medium data-active:text-zinc-900 dark:text-zinc-400 dark:data-active:bg-zinc-800 dark:data-active:text-zinc-50 dark:hover:bg-zinc-800"
            >
              Benefits
            </ScrollSpyItem>
          </div>
          <ScrollSpyItem
            value="installation"
            className="rounded px-3 py-1.5 text-sm text-zinc-600 transition-colors hover:bg-zinc-100 data-active:bg-zinc-100 data-active:font-medium data-active:text-zinc-900 dark:text-zinc-400 dark:data-active:bg-zinc-800 dark:data-active:text-zinc-50 dark:hover:bg-zinc-800"
          >
            Installation
          </ScrollSpyItem>
          <ScrollSpyItem
            value="examples"
            className="rounded px-3 py-1.5 text-sm text-zinc-600 transition-colors hover:bg-zinc-100 data-active:bg-zinc-100 data-active:font-medium data-active:text-zinc-900 dark:text-zinc-400 dark:data-active:bg-zinc-800 dark:data-active:text-zinc-50 dark:hover:bg-zinc-800"
          >
            Examples
          </ScrollSpyItem>
        </div>
      </ScrollSpyList>

      <div className="flex-1 space-y-8">
        <ScrollSpyContent id="overview">
          <h2 className="font-bold text-2xl">Overview</h2>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            A comprehensive overview of the ScrollSpy component.
          </p>
          <div className="mt-4 h-32 rounded-lg bg-zinc-100 dark:bg-zinc-800" />
        </ScrollSpyContent>

        <ScrollSpyContent id="overview-features">
          <h3 className="font-semibold text-xl">Features</h3>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            Key features include automatic tracking, smooth scrolling, and
            customizable offsets.
          </p>
          <div className="mt-4 h-48 rounded-lg bg-zinc-100 dark:bg-zinc-800" />
        </ScrollSpyContent>

        <ScrollSpyContent id="overview-benefits">
          <h3 className="font-semibold text-xl">Benefits</h3>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            Improves user experience and navigation in long-form content.
          </p>
          <div className="mt-4 h-48 rounded-lg bg-zinc-100 dark:bg-zinc-800" />
        </ScrollSpyContent>

        <ScrollSpyContent id="installation">
          <h2 className="font-bold text-2xl">Installation</h2>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            Install via npm, pnpm, or copy the source code directly.
          </p>
          <div className="mt-4 h-64 rounded-lg bg-zinc-100 dark:bg-zinc-800" />
        </ScrollSpyContent>

        <ScrollSpyContent id="examples">
          <h2 className="font-bold text-2xl">Examples</h2>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            Explore various examples of the ScrollSpy component in action.
          </p>
          <div className="mt-4 h-64 rounded-lg bg-zinc-100 dark:bg-zinc-800" />
        </ScrollSpyContent>
      </div>
    </ScrollSpy>
  );
}
