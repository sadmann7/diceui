import "@testing-library/jest-dom";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, test, vi } from "vitest";

import { SkipLink as BaseSkipLink } from "@/registry/bases/base/components/skip-link";
import { SkipLink as RadixSkipLink } from "@/registry/bases/radix/components/skip-link";

beforeAll(() => {
  // jsdom doesn't implement scrollIntoView
  Element.prototype.scrollIntoView = vi.fn();
});

afterEach(cleanup);

describe.each([
  ["base", BaseSkipLink],
  ["radix", RadixSkipLink],
])("SkipLink (%s)", (_base, SkipLink) => {
  test("renders a link to #main-content by default", () => {
    render(<SkipLink />);

    const link = screen.getByRole("link", { name: "Skip to content" });
    expect(link).toHaveAttribute("href", "#main-content");
    expect(link).toHaveAttribute("data-slot", "skip-link");
  });

  test("moves focus to the target without changing the URL", () => {
    render(
      <>
        <SkipLink />
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
        <SkipLink />
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
        <SkipLink href="#search">Skip to search</SkipLink>
        <input id="search" aria-label="Search" />
      </>,
    );

    fireEvent.click(screen.getByRole("link", { name: "Skip to search" }));

    const input = screen.getByRole("textbox");
    expect(input).not.toHaveAttribute("tabindex");
    expect(input).toHaveFocus();
  });

  test("falls back to the native link when the target is missing", () => {
    render(<SkipLink href="#missing" />);

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
        <SkipLink onClick={(event) => event.preventDefault()} />
        <main id="main-content">Content</main>
      </>,
    );

    fireEvent.click(screen.getByRole("link"));

    expect(screen.getByRole("main")).not.toHaveFocus();
  });
});
