import { Circle } from "lucide-react";
import {
  ScrollSpy,
  ScrollSpyContent,
  ScrollSpyItem,
  ScrollSpyList,
} from "@/registry/default/ui/scrollspy";

export default function ScrollSpyCustomDemo() {
  return (
    <ScrollSpy
      offset={100}
      rootMargin="0px 0px -70% 0px"
      className="flex gap-8"
    >
      <ScrollSpyList className="sticky top-20 h-fit w-64">
        <div className="flex flex-col gap-3 border-zinc-200 border-l-2 pl-4 dark:border-zinc-800">
          <ScrollSpyItem
            value="step-one"
            className="group flex items-center gap-3 text-sm text-zinc-600 transition-colors hover:text-zinc-900 data-active:text-zinc-900 dark:text-zinc-400 dark:data-active:text-zinc-50 dark:hover:text-zinc-50"
          >
            <Circle className="size-2 fill-current opacity-0 transition-opacity group-data-active:opacity-100" />
            <span className="font-normal group-data-active:font-semibold">
              Step One
            </span>
          </ScrollSpyItem>
          <ScrollSpyItem
            value="step-two"
            className="group flex items-center gap-3 text-sm text-zinc-600 transition-colors hover:text-zinc-900 data-active:text-zinc-900 dark:text-zinc-400 dark:data-active:text-zinc-50 dark:hover:text-zinc-50"
          >
            <Circle className="size-2 fill-current opacity-0 transition-opacity group-data-active:opacity-100" />
            <span className="font-normal group-data-active:font-semibold">
              Step Two
            </span>
          </ScrollSpyItem>
          <ScrollSpyItem
            value="step-three"
            className="group flex items-center gap-3 text-sm text-zinc-600 transition-colors hover:text-zinc-900 data-active:text-zinc-900 dark:text-zinc-400 dark:data-active:text-zinc-50 dark:hover:text-zinc-50"
          >
            <Circle className="size-2 fill-current opacity-0 transition-opacity group-data-active:opacity-100" />
            <span className="font-normal group-data-active:font-semibold">
              Step Three
            </span>
          </ScrollSpyItem>
          <ScrollSpyItem
            value="step-four"
            className="group flex items-center gap-3 text-sm text-zinc-600 transition-colors hover:text-zinc-900 data-active:text-zinc-900 dark:text-zinc-400 dark:data-active:text-zinc-50 dark:hover:text-zinc-50"
          >
            <Circle className="size-2 fill-current opacity-0 transition-opacity group-data-active:opacity-100" />
            <span className="font-normal group-data-active:font-semibold">
              Step Four
            </span>
          </ScrollSpyItem>
        </div>
      </ScrollSpyList>

      <div className="flex-1 space-y-12">
        <ScrollSpyContent value="step-one">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-full bg-blue-100 font-semibold text-blue-700 text-lg dark:bg-blue-900 dark:text-blue-300">
              1
            </div>
            <h2 className="font-bold text-2xl">Step One</h2>
          </div>
          <p className="mt-4 text-zinc-600 dark:text-zinc-400">
            Begin your journey by setting up the initial configuration.
          </p>
          <div className="mt-6 h-64 rounded-lg bg-linear-to-br from-blue-50 to-indigo-100 dark:from-blue-950 dark:to-indigo-900" />
        </ScrollSpyContent>

        <ScrollSpyContent value="step-two">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-full bg-purple-100 font-semibold text-lg text-purple-700 dark:bg-purple-900 dark:text-purple-300">
              2
            </div>
            <h2 className="font-bold text-2xl">Step Two</h2>
          </div>
          <p className="mt-4 text-zinc-600 dark:text-zinc-400">
            Configure your components with custom settings and options.
          </p>
          <div className="mt-6 h-64 rounded-lg bg-linear-to-br from-purple-50 to-pink-100 dark:from-purple-950 dark:to-pink-900" />
        </ScrollSpyContent>

        <ScrollSpyContent value="step-three">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-full bg-green-100 font-semibold text-green-700 text-lg dark:bg-green-900 dark:text-green-300">
              3
            </div>
            <h2 className="font-bold text-2xl">Step Three</h2>
          </div>
          <p className="mt-4 text-zinc-600 dark:text-zinc-400">
            Implement your solution and test functionality.
          </p>
          <div className="mt-6 h-64 rounded-lg bg-linear-to-br from-green-50 to-emerald-100 dark:from-green-950 dark:to-emerald-900" />
        </ScrollSpyContent>

        <ScrollSpyContent value="step-four">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-full bg-orange-100 font-semibold text-lg text-orange-700 dark:bg-orange-900 dark:text-orange-300">
              4
            </div>
            <h2 className="font-bold text-2xl">Step Four</h2>
          </div>
          <p className="mt-4 text-zinc-600 dark:text-zinc-400">
            Deploy your changes and monitor performance metrics.
          </p>
          <div className="mt-6 h-64 rounded-lg bg-linear-to-br from-orange-50 to-amber-100 dark:from-orange-950 dark:to-amber-900" />
        </ScrollSpyContent>
      </div>
    </ScrollSpy>
  );
}
