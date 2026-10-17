import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, test, vi } from "vitest";

import {
  MAIN_CONTENT_ID as BASE_MAIN_CONTENT_ID,
  SkipNav as BaseSkipNav,
} from "@/registry/bases/base/components/skip-nav";
import {
  MAIN_CONTENT_ID as RADIX_MAIN_CONTENT_ID,
  SkipNav as RadixSkipNav,
} from "@/registry/bases/radix/components/skip-nav";

beforeAll(() => {
  // jsdom doesn't implement scrollIntoView
  Element.prototype.scrollIntoView = vi.fn();
});

afterEach(cleanup);

describe.each([
  ["base", BaseSkipNav, BASE_MAIN_CONTENT_ID],
  ["radix", RadixSkipNav, RADIX_MAIN_CONTENT_ID],
])("SkipNav (%s)", (_base, SkipNav, MAIN_CONTENT_ID) => {
  test("renders a link to MAIN_CONTENT_ID by default", () => {
    render(<SkipNav />);

    const link = screen.getByRole("link", { name: "Skip to content" });
    expect(MAIN_CONTENT_ID).toBe("main-content");
    expect(link).toHaveAttribute("href", `#${MAIN_CONTENT_ID}`);
    expect(link).toHaveAttribute("data-slot", "skip-nav");
  });

  test("moves focus to the target without changing the URL", () => {
    render(
      <>
        <SkipNav />
        <main id="main-content">Content</main>
      </>,
    );

    const main = screen.getByRole("main");
    const clickEvent = new MouseEvent("click", {
      bubbles: true,
      cancelable: true,
    });
    fireEvent(screen.getByRole("link"), clickEvent);

    expect(clickEvent.defaultPrevented).toBe(true);
    expect(main).toHaveAttribute("tabindex", "-1");
    expect(main).toHaveFocus();
    expect(main.scrollIntoView).toHaveBeenCalledWith({ block: "start" });
  });

  test("hides the outline on a temporarily focusable target until blur", () => {
    render(
      <>
        <SkipNav />
        <main id="main-content" style={{ outline: "1px solid red" }}>
          Content
        </main>
      </>,
    );

    const main = screen.getByRole("main");
    fireEvent.click(screen.getByRole("link"));

    expect(main.style.outline).toBe("none");

    main.blur();

    expect(main).not.toHaveAttribute("tabindex");
    expect(main.style.outline).toBe("1px solid red");
  });

  test("keeps a focusable target in the tab order", () => {
    render(
      <>
        <SkipNav href="#search">Skip to search</SkipNav>
        <input id="search" aria-label="Search" />
      </>,
    );

    fireEvent.click(screen.getByRole("link", { name: "Skip to search" }));

    const input = screen.getByRole("textbox");
    expect(input).not.toHaveAttribute("tabindex");
    expect(input).toHaveFocus();
  });

  test("falls back to the native link when the target is missing", () => {
    render(<SkipNav href="#missing" />);

    const clickEvent = new MouseEvent("click", {
      bubbles: true,
      cancelable: true,
    });
    fireEvent(screen.getByRole("link"), clickEvent);

    expect(clickEvent.defaultPrevented).toBe(false);
  });

  test("respects a prevented onClick", () => {
    render(
      <>
        <SkipNav onClick={(event) => event.preventDefault()} />
        <main id="main-content">Content</main>
      </>,
    );

    fireEvent.click(screen.getByRole("link"));

    expect(screen.getByRole("main")).not.toHaveFocus();
  });
});
