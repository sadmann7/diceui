import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";

import * as BaseBanner from "@/registry/bases/base/ui/banner";
import * as RadixBanner from "@/registry/bases/radix/ui/banner";

describe.each([
  ["radix", RadixBanner],
  ["base", BaseBanner],
])("Banner (%s) controlled", (_, { Banner, BannerClose, Banners }) => {
  function renderBanner(open: boolean, onOpenChange = vi.fn()) {
    function getBanner(nextOpen: boolean) {
      return (
        <Banner open={nextOpen} onOpenChange={onOpenChange}>
          Saved
          <BannerClose aria-label="Close" />
        </Banner>
      );
    }
    const result = render(getBanner(open));
    return {
      onOpenChange,
      rerender: (nextOpen: boolean) => result.rerender(getBanner(nextOpen)),
    };
  }

  test("stays open when the parent rejects closing", () => {
    const { onOpenChange } = renderBanner(true);

    fireEvent.click(screen.getByRole("button", { name: "Close" }));

    expect(onOpenChange).toHaveBeenCalledExactlyOnceWith(false);
    expect(screen.getByRole("status")).toHaveTextContent("Saved");
  });

  test("doesn't call onOpenChange when the open prop changes", () => {
    const { onOpenChange, rerender } = renderBanner(true);

    rerender(false);

    expect(onOpenChange).not.toHaveBeenCalled();
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  test("closes an uncontrolled banner", () => {
    render(
      <Banner>
        Saved
        <BannerClose aria-label="Close" />
      </Banner>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Close" }));

    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  test("queues a banner inside Banners", () => {
    render(
      <Banners strategy="static">
        <Banner>Queued</Banner>
      </Banners>,
    );

    expect(screen.getByRole("status")).toHaveTextContent("Queued");
  });
});
