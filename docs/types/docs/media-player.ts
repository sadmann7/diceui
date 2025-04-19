import type { CompositionProps, EmptyProps } from "@/types";
import type { SliderProps } from "@radix-ui/react-slider";
import type * as React from "react";

export interface RootProps
  extends Omit<
      React.ComponentPropsWithoutRef<"div">,
      "onTimeUpdate" | "onVolumeChange"
    >,
    CompositionProps {
  /**
   * The default volume level (0-1).
   * @default 1
   */
  defaultVolume?: number;

  /**
   * Whether the media player should be muted by default.
   * @default false
   */
  defaultMuted?: boolean;

  /**
   * Whether the media player should start playing automatically.
   * @default false
   */
  defaultPlaying?: boolean;

  /**
   * Whether the media should loop by default.
   * @default false
   */
  defaultLoop?: boolean;

  /**
   * Callback function triggered when the media starts playing.
   */
  onPlay?: () => void;

  /**
   * Callback function triggered when the media is paused.
   */
  onPause?: () => void;

  /**
   * Callback function triggered when the media playback ends.
   */
  onEnded?: () => void;

  /**
   * Callback function triggered when the current playback time updates.
   */
  onTimeUpdate?: (time: number) => void;

  /**
   * Callback function triggered when the volume changes.
   */
  onVolumeChange?: (volume: number) => void;

  /**
   * Callback function triggered when the muted state changes.
   */
  onMuted?: (muted: boolean) => void;

  /**
   * The text direction of the component.
   * @default "ltr"
   */
  dir?: "ltr" | "rtl";

  /**
   * A label for the media player, used for accessibility.
   * @default "Media player"
   */
  label?: string;

  /**
   * Whether the media player controls are disabled.
   * @default false
   */
  disabled?: boolean;
}

export interface ControlsProps extends EmptyProps<"div">, CompositionProps {}

export interface OverlayProps extends EmptyProps<"div">, CompositionProps {}

export interface PlayProps extends EmptyProps<"button">, CompositionProps {}

export interface SeekForwardProps
  extends EmptyProps<"button">,
    CompositionProps {
  /**
   * The number of seconds to seek forward.
   * @default 10
   */
  seconds?: number;
}

export interface SeekBackwardProps
  extends EmptyProps<"button">,
    CompositionProps {
  /**
   * The number of seconds to seek backward.
   * @default 10
   */
  seconds?: number;
}

export interface SeekProps extends SliderProps, CompositionProps {
  /**
   * Whether to display the current time and remaining time alongside the seek bar.
   * @default false
   */
  withTime?: boolean;
}

export interface VolumeProps extends SliderProps, CompositionProps {
  /**
   * Whether the volume slider should expand on hover.
   * @default false
   */
  expandable?: boolean;
}

export interface TimeProps extends EmptyProps<"div">, CompositionProps {
  /**
   * The format variant for displaying time.
   * - `default`: Shows "currentTime / duration" (e.g., "1:23 / 5:00").
   * - `remaining`: Shows the remaining time (e.g., "3:37").
   * - `duration`: Shows the total duration (e.g., "5:00").
   * @default "default"
   */
  variant?: "default" | "remaining" | "duration";
}

export interface FullscreenProps
  extends EmptyProps<"button">,
    CompositionProps {}

export interface PiPProps extends EmptyProps<"button">, CompositionProps {}

export interface VideoProps extends EmptyProps<"video">, CompositionProps {}

export interface AudioProps extends EmptyProps<"audio">, CompositionProps {}

export interface PlaybackSpeedProps
  extends EmptyProps<"div">,
    CompositionProps {
  /**
   * An array of playback speed options.
   * @default [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2]
   */
  speeds?: number[];
}

export interface CaptionsProps extends EmptyProps<"button">, CompositionProps {}

export interface DownloadProps extends EmptyProps<"button">, CompositionProps {}
