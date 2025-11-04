import {
  ScrollSpy,
  ScrollSpyContent,
  ScrollSpyContentGroup,
  ScrollSpyItem,
  ScrollSpyItemGroup,
} from "@/registry/default/ui/scroll-spy";

export default function ScrollSpyNestedDemo() {
  return (
    <ScrollSpy>
      <ScrollSpyItemGroup asChild className="sticky top-20 h-fit w-56">
        <div className="flex flex-col gap-1">
          <ScrollSpyItem value="overview">Overview</ScrollSpyItem>
          <div className="ml-4 flex flex-col gap-1">
            <ScrollSpyItem value="overview-features">Features</ScrollSpyItem>
            <ScrollSpyItem value="overview-benefits">Benefits</ScrollSpyItem>
          </div>
          <ScrollSpyItem value="installation">Installation</ScrollSpyItem>
          <ScrollSpyItem value="examples">Examples</ScrollSpyItem>
        </div>
      </ScrollSpyItemGroup>
      <ScrollSpyContentGroup>
        <ScrollSpyContent value="overview">
          <h2 className="font-bold text-2xl">Overview</h2>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            A comprehensive overview of the ScrollSpy component.
          </p>
          <div className="mt-4 h-32 rounded-lg bg-zinc-100 dark:bg-zinc-800" />
        </ScrollSpyContent>
        <ScrollSpyContent value="overview-features">
          <h3 className="font-semibold text-xl">Features</h3>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            Key features include automatic tracking, smooth scrolling, and
            customizable offsets.
          </p>
          <div className="mt-4 h-48 rounded-lg bg-zinc-100 dark:bg-zinc-800" />
        </ScrollSpyContent>
        <ScrollSpyContent value="overview-benefits">
          <h3 className="font-semibold text-xl">Benefits</h3>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            Improves user experience and navigation in long-form content.
          </p>
          <div className="mt-4 h-48 rounded-lg bg-zinc-100 dark:bg-zinc-800" />
        </ScrollSpyContent>
        <ScrollSpyContent value="installation">
          <h2 className="font-bold text-2xl">Installation</h2>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            Install via npm, pnpm, or copy the source code directly.
          </p>
          <div className="mt-4 h-64 rounded-lg bg-zinc-100 dark:bg-zinc-800" />
        </ScrollSpyContent>
        <ScrollSpyContent value="examples">
          <h2 className="font-bold text-2xl">Examples</h2>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            Explore various examples of the ScrollSpy component in action.
          </p>
          <div className="mt-4 h-64 rounded-lg bg-zinc-100 dark:bg-zinc-800" />
        </ScrollSpyContent>
      </ScrollSpyContentGroup>
    </ScrollSpy>
  );
}
