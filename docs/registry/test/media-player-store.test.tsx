import "@testing-library/jest-dom/vitest";
import { render } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import * as BaseMediaPlayer from "@/registry/bases/base/ui/media-player";
import * as RadixMediaPlayer from "@/registry/bases/radix/ui/media-player";

class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

global.ResizeObserver = ResizeObserver;

describe.each([
  ["radix", RadixMediaPlayer],
  ["base", BaseMediaPlayer],
])(
  "MediaPlayer (%s) store",
  (
    _,
    {
      MediaPlayer,
      MediaPlayerControls,
      MediaPlayerControlsOverlay,
      MediaPlayerVolumeIndicator,
      useMediaPlayerStore,
    },
  ) => {
    function ControlsState() {
      const controlsVisible = useMediaPlayerStore(
        (state) => state.controlsVisible,
      );
      return <output>{String(controlsVisible)}</output>;
    }

    test("shares the controls state with every part", () => {
      const { container, getByRole } = render(
        <MediaPlayer>
          <MediaPlayerVolumeIndicator />
          <MediaPlayerControlsOverlay />
          <MediaPlayerControls>
            <ControlsState />
          </MediaPlayerControls>
        </MediaPlayer>,
      );

      expect(getByRole("status")).toHaveTextContent("true");
      expect(
        container.querySelector("[data-slot='media-player-controls']"),
      ).toHaveAttribute("data-visible");
      expect(
        container.querySelector("[data-slot='media-player-volume-indicator']"),
      ).not.toBeInTheDocument();
    });
  },
);
