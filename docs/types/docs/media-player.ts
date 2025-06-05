import type { Button } from "@/components/ui/button";
import type {
  DropdownMenu,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { CompositionProps, EmptyProps } from "@/types";
import type { Slider } from "@radix-ui/react-slider";

interface MediaPlayerDropdownMenuProps
  extends React.ComponentProps<typeof DropdownMenuTrigger>,
    React.ComponentProps<typeof Button>,
    Omit<React.ComponentProps<typeof DropdownMenu>, "dir"> {}

export interface RootProps extends EmptyProps<"div">, CompositionProps {
  /**
   * Callback function triggered when the media starts playing.
   *
   * ```ts
   * const onPlay = () => {
   *   console.log("Media started playing")
   * }
   *
   * <MediaPlayer onPlay={onPlay} />
   * ```
   */
  onPlay?: () => void;

  /**
   * Callback function triggered when the media is paused.
   *
   * ```ts
   * const onPause = () => {
   *   console.log("Media paused")
   * }
   *
   * <MediaPlayer onPause={onPause} />
   * ```
   */
  onPause?: () => void;

  /**
   * Callback function triggered when the media playback ends.
   *
   * ```ts
   * const onEnded = () => {
   *   console.log("Media finished playing")
   * }
   *
   * <MediaPlayer onEnded={onEnded} />
   * ```
   */
  onEnded?: () => void;

  /**
   * Callback function triggered when the current playback time updates.
   *
   * ```ts
   * const onTimeUpdate = (time: number) => {
   *   console.log({ currentTime: time })
   * }
   *
   * <MediaPlayer onTimeUpdate={onTimeUpdate} />
   * ```
   */
  onTimeUpdate?: (time: number) => void;

  /**
   * Callback function triggered when the volume changes.
   *
   * ```ts
   * const onVolumeChange = (volume: number) => {
   *   console.log({ volume })
   * }
   *
   * <MediaPlayer onVolumeChange={onVolumeChange} />
   * ```
   */
  onVolumeChange?: (volume: number) => void;

  /**
   * Callback function triggered when the muted state changes.
   *
   * ```ts
   * const onMuted = (muted: boolean) => {
   *   console.log({ muted })
   * }
   *
   * <MediaPlayer onMuted={onMuted} />
   * ```
   */
  onMuted?: (muted: boolean) => void;

  /**
   * Callback function triggered when triggering picture in picture (PiP) state.
   *
   * The first argument is the unknown error that occurred.
   * The second argument is the state on which the error occurred.
   * - `enter`: The error occurred when entering PIP.
   * - `exit`: The error occurred when exiting PIP.
   */
  onPipError?: (error: unknown, state: "enter" | "exit") => void;

  /**
   * Callback function triggered when the fullscreen state changes.
   *
   * ```ts
   * const onFullscreenChange = (fullscreen: boolean) => {
   *   console.log({ fullscreen })
   * }
   *
   * <MediaPlayer onFullscreenChange={onFullscreenChange} />
   * ```
   */
  onFullscreenChange?: (fullscreen: boolean) => void;

  /**
   * The text direction of the component.
   *
   * ```ts
   * // For RTL languages
   * <MediaPlayer dir="rtl" />
   * ```
   */
  dir?: "ltr" | "rtl";

  /**
   * A label for the media player, used for accessibility.
   *
   * ```ts
   * <MediaPlayer label="My custom video player" />
   * ```
   *
   * @default "Media player"
   */
  label?: string;

  /**
   * The distance in pixels from the trigger to position the tooltip.
   *
   * ```ts
   * <MediaPlayer tooltipSideOffset={15} />
   * ```
   *
   * @default 10
   */
  tooltipSideOffset?: number;

  /**
   * Whether to enable auto-hiding behavior for `MediaPlayer.Controls` and `MediaPlayer.Overlay`.
   *
   * Controls will show on pause/interaction and auto-hide after 3 seconds
   * of inactivity during playback. Also hides immediately on mouse leave.
   *
   * ```ts
   * <MediaPlayer autohide />
   * ```
   *
   * @default false
   *
   */
  autohide?: boolean;

  /**
   * Whether the media player controls are disabled.
   *
   * ```ts
   * <MediaPlayer disabled={isLoading} />
   * ```
   *
   * @default false
   */
  disabled?: boolean;

  /**
   * Whether to disable tooltips throughout the media player.
   *
   * ```ts
   * <MediaPlayer withoutTooltip />
   * ```
   *
   * @default false
   */
  withoutTooltip?: boolean;
}

export interface VideoProps extends EmptyProps<"video">, CompositionProps {}

export interface AudioProps extends EmptyProps<"audio">, CompositionProps {}

export interface ControlsProps extends EmptyProps<"div">, CompositionProps {}

export interface OverlayProps extends EmptyProps<"div">, CompositionProps {}

export interface LoadingProps extends EmptyProps<"div">, CompositionProps {
  /**
   * The delay in milliseconds before showing the loading indicator.
   *
   * ```ts
   * <MediaPlayer.Loading delay={400} />
   * ```
   *
   * @default 500
   */
  delay?: number;
}

export interface VolumeIndicatorProps
  extends EmptyProps<"div">,
    CompositionProps {}

export interface PlayProps extends EmptyProps<"button">, CompositionProps {}

export interface SeekBackwardProps
  extends EmptyProps<"button">,
    CompositionProps {
  /**
   * The number of seconds to seek backward.
   *
   * ```ts
   * <MediaPlayer.SeekBackward seconds={10} />
   * ```
   *
   * @default 5
   */
  seconds?: number;
}

export interface SeekForwardProps
  extends EmptyProps<"button">,
    CompositionProps {
  /**
   * The number of seconds to seek forward.
   *
   * ```ts
   * <MediaPlayer.SeekForward seconds={15} />
   * ```
   *
   * @default 10
   */
  seconds?: number;
}

export interface SeekProps
  extends Omit<
      React.ComponentProps<typeof Slider>,
      keyof React.ComponentProps<"div">
    >,
    CompositionProps {
  /**
   * Whether to display the current time and remaining time alongside the seek bar.
   *
   * ```ts
   * <MediaPlayer.Seek withTime />
   * ```
   *
   * @default false
   */
  withTime?: boolean;

  /**
   * Whether to show chapter markers on the seek bar.
   *
   * ```ts
   * <MediaPlayer.Seek withoutChapter />
   * ```
   *
   * @default true
   */
  withoutChapter?: boolean;

  /**
   * Whether to disable the seek tooltip entirely.
   * This overrides the global `withoutTooltip` prop for this component.
   *
   * ```ts
   * <MediaPlayer.Seek withoutTooltip />
   * ```
   *
   * @default false
   */
  withoutTooltip?: boolean;

  /**
   * Custom preview thumbnail source for seek preview.
   * Can be a string URL or a function that returns a URL based on time.
   *
   * ```ts
   * // Static thumbnail
   * <MediaPlayer.Seek tooltipThumbnailSrc="/thumbnail.jpg" />
   * ```
   *
   * ```ts
   * // Dynamic thumbnails
   * <MediaPlayer.Seek
   *   tooltipThumbnailSrc={(time) => `/thumbnails/${Math.floor(time)}.jpg`}
   * />
   * ```
   */
  tooltipThumbnailSrc?: string | ((time: number) => string);

  /**
   * The variant of the tooltip display.
   * - `time`: Shows only the seek time (e.g., "1:23")
   * - `time-duration`: Shows time and duration (e.g., "1:23 / 5:00")
   *
   * ```ts
   * <MediaPlayer.Seek tooltipVariant="time-duration" />
   * ```
   *
   * @default "time"
   */
  tooltipVariant?: "time" | "time-duration";

  /**
   * The distance in pixels from the seek bar to position the tooltip.
   *
   * ```ts
   * <MediaPlayer.Seek tooltipSideOffset={15} />
   * ```
   *
   * @default 10
   */
  tooltipSideOffset?: number;

  /**
   * Element(s) to use as collision boundaries for tooltip positioning.
   * Defaults to the media player root element.
   *
   * ```ts
   * // Single collision boundary
   * <MediaPlayer.Seek tooltipCollisionBoundary={element} />
   * ```
   *
   * ```ts
   * // Multiple collision boundaries
   * <MediaPlayer.Seek tooltipCollisionBoundary={[element1, element2]} />
   * ```
   */
  tooltipCollisionBoundary?: Element | Element[];

  /**
   * The padding in pixels from the collision boundary for tooltip positioning.
   * Can be a number for uniform padding or an object for per-side padding.
   *
   * ```ts
   * // Uniform padding
   * <MediaPlayer.Seek tooltipCollisionPadding={20} />
   * ```
   *
   * ```ts
   * // Per-side padding
   * <MediaPlayer.Seek
   *   tooltipCollisionPadding={{ top: 10, right: 15, bottom: 10, left: 15 }}
   * />
   * ```
   *
   * @default 10
   */
  tooltipCollisionPadding?:
    | number
    | Partial<Record<"top" | "right" | "bottom" | "left", number>>;
}

export interface VolumeProps
  extends Omit<
      React.ComponentProps<typeof Slider>,
      keyof React.ComponentProps<"div">
    >,
    CompositionProps {
  /**
   * Whether the volume slider should expand on hover.
   *
   * ```ts
   * <MediaPlayer.Volume expandable />
   * ```
   *
   * @default false
   */
  expandable?: boolean;
}

export interface TimeProps extends EmptyProps<"div">, CompositionProps {
  /**
   * The format variant for displaying time.
   * - `progress`: Shows "currentTime / duration" (e.g., "1:23 / 5:00").
   * - `remaining`: Shows the remaining time (e.g., "3:37").
   * - `duration`: Shows the total duration (e.g., "5:00").
   *
   * ```ts
   * <MediaPlayer.Time variant="remaining" />
   * ```
   *
   * @default "progress"
   */
  variant?: "progress" | "remaining" | "duration";
}

export interface PlaybackSpeedProps
  extends Omit<
      MediaPlayerDropdownMenuProps,
      keyof React.ComponentProps<"button">
    >,
    CompositionProps {
  /**
   * Whether the dropdown menu is open by default.
   * @default false
   */
  defaultOpen?: boolean;

  /**
   * Whether the dropdown menu is open.
   * @default false
   */
  open?: boolean;

  /** Callback function triggered when the dropdown menu is opened or closed. */
  onOpenChange?: (open: boolean) => void;

  /**
   * Whether the dropdown menu is modal.
   * @default false
   */
  modal?: boolean;

  /**
   * The distance in pixels from the trigger to position the dropdown.
   * @default 10
   */
  sideOffset?: number;

  /**
   * An array of playback speed options.
   * @default [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2]
   */
  speeds?: number[];
}

export interface LoopProps extends EmptyProps<"button">, CompositionProps {}

export interface PiPProps
  extends EmptyProps<"button">,
    CompositionProps,
    Pick<RootProps, "onPipError"> {}

export interface FullscreenProps
  extends EmptyProps<"button">,
    CompositionProps {}

export interface CaptionsProps extends EmptyProps<"button">, CompositionProps {}

export interface DownloadProps extends EmptyProps<"button">, CompositionProps {}

export interface SettingsProps
  extends Omit<PlaybackSpeedProps, keyof React.ComponentProps<"button">>,
    CompositionProps {
  /**
   * The settings menu provides a unified interface for adjusting playback speed,
   * video quality, and captions. It automatically detects available options
   * and only shows relevant settings.
   *
   * Features:
   * - Playback speed control (uses `speeds` prop)
   * - Video quality selection (when multiple renditions available)
   * - Captions/subtitles toggle and track selection
   * - Organized in expandable submenus
   *
   * ```tsx
   * // Basic usage with default speeds
   * <MediaPlayer.Settings />
   * ```
   *
   * ```tsx
   * // Custom playback speeds
   * <MediaPlayer.Settings speeds={[0.25, 0.5, 1, 1.5, 2]} />
   * ```
   *
   * The component automatically adapts based on:
   * - Available video renditions (HLS/DASH quality options)
   * - Text tracks for captions/subtitles
   * - Media type (video vs audio)
   */
}

export interface PortalProps {
  /**
   * The content to render in the portal.
   * This content will be rendered in the appropriate container
   * based on the current fullscreen state.
   */
  children: React.ReactNode;
}

export interface TooltipProps extends React.ComponentProps<"div"> {
  /**
   * The tooltip text to display.
   *
   * ```tsx
   * <MediaPlayer.Tooltip tooltip="Play video">
   *   <button>▶</button>
   * </MediaPlayer.Tooltip>
   * ```
   */
  tooltip?: string;

  /**
   * Keyboard shortcut(s) to display in the tooltip.
   * Can be a string for a single shortcut or an array for multiple shortcuts.
   *
   * ```tsx
   * // Single shortcut
   * <MediaPlayer.Tooltip tooltip="Play" shortcut="Space">
   *   <button>▶</button>
   * </MediaPlayer.Tooltip>
   * ```
   *
   * ```tsx
   * // Multiple shortcuts
   * <MediaPlayer.Tooltip tooltip="Seek" shortcut={["←", "→"]}>
   *   <button>Seek</button>
   * </MediaPlayer.Tooltip>
   * ```
   */
  shortcut?: string | string[];
}
