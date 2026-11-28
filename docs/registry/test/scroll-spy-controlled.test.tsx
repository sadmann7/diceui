import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeAll, describe, expect, test, vi } from "vitest";

import * as BaseScrollSpy from "@/registry/bases/base/ui/scroll-spy";
import * as RadixScrollSpy from "@/registry/bases/radix/ui/scroll-spy";

beforeAll(() => {
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
      takeRecords() {
        return [];
      }
    },
  );
  vi.stubGlobal(
    "matchMedia",
    vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  );
  window.scrollTo = vi.fn();
});

describe.each([
  ["radix", RadixScrollSpy],
  ["base", BaseScrollSpy],
])(
  "ScrollSpy (%s) controlled",
  (_, { ScrollSpy, ScrollSpyLink, ScrollSpyNav, ScrollSpySection }) => {
    function renderScrollSpy(value: string, onValueChange = vi.fn()) {
      function getScrollSpy(nextValue: string) {
        return (
          <ScrollSpy value={nextValue} onValueChange={onValueChange}>
            <ScrollSpyNav>
              <ScrollSpyLink value="one">One</ScrollSpyLink>
              <ScrollSpyLink value="two">Two</ScrollSpyLink>
            </ScrollSpyNav>
            <ScrollSpySection value="one">One</ScrollSpySection>
            <ScrollSpySection value="two">Two</ScrollSpySection>
          </ScrollSpy>
        );
      }
      const result = render(getScrollSpy(value));
      return {
        onValueChange,
        rerender: (nextValue: string) =>
          result.rerender(getScrollSpy(nextValue)),
      };
    }

    test("keeps the controlled value when the parent rejects a change", () => {
      const { onValueChange } = renderScrollSpy("one");

      fireEvent.click(screen.getByRole("link", { name: "Two" }));

      expect(onValueChange).toHaveBeenCalledExactlyOnceWith("two");
      expect(screen.getByRole("link", { name: "One" })).toHaveAttribute(
        "data-state",
        "active",
      );
      expect(screen.getByRole("link", { name: "Two" })).toHaveAttribute(
        "data-state",
        "inactive",
      );
    });

    test("doesn't call onValueChange when the value prop changes", () => {
      const { onValueChange, rerender } = renderScrollSpy("one");

      rerender("two");

      expect(onValueChange).not.toHaveBeenCalled();
      expect(screen.getByRole("link", { name: "Two" })).toHaveAttribute(
        "data-state",
        "active",
      );
    });
  },
);
