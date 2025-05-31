import type { DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import type { SelectTrigger } from "@/components/ui/select";
import type { CompositionProps, EmptyProps } from "@/types";
import type { Slider } from "@radix-ui/react-slider";

export interface RootProps extends EmptyProps<"div">, CompositionProps {
  /**
   * The default volume level (0-1).
   * @default 1
   *
   * ```ts
   * <MediaPlayer defaultVolume={0.5} />
   * ```
   */
  defaultVolume?: number;

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
   * Callback function triggered when triggering picture in picture (PiP) mode.
   *
   * The first argument is the unknown error that occurred.
   * The second argument is the mode on which the error occurred.
   * - `enter`: The error occurred when entering PIP.
   * - `exit`: The error occurred when exiting PIP.
   */
  onPipError?: (error: unknown, mode: "enter" | "exit") => void;

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
   * @default "ltr"
   *
   * ```ts
   * // For RTL languages
   * <MediaPlayer dir="rtl" />
   * ```
   */
  dir?: "ltr" | "rtl";

  /**
   * A label for the media player, used for accessibility.
   * @default "Media player"
   *
   * ```ts
   * <MediaPlayer label="My custom video player" />
   * ```
   */
  label?: string;

  /**
   * Whether the media player controls are disabled.
   * @default false
   *
   * ```ts
   * // Disable player controls
   * <MediaPlayer disabled />
   * ```
   *
   * ```ts
   * <MediaPlayer disabled={isLoading} />
   * ```
   */
  disabled?: boolean;
}

export interface VideoProps extends EmptyProps<"video">, CompositionProps {}

export interface AudioProps extends EmptyProps<"audio">, CompositionProps {}

export interface ControlsProps extends EmptyProps<"div">, CompositionProps {}

export interface OverlayProps extends EmptyProps<"div">, CompositionProps {}

export interface LoadingProps extends EmptyProps<"div">, CompositionProps {
  /**
   * The delay in milliseconds before showing the loading indicator.
   * @default 500
   *
   * ```ts
   * // Show loading immediately
   * <MediaPlayer.Loading delay={0} />
   * ```
   *
   * ```ts
   * // Custom delay
   * <MediaPlayer.Loading delay={1000} />
   * ```
   */
  delay?: number;

  /**
   * The visual variant of the loading indicator.
   * @default "default"
   *
   * ```ts
   * // Use dots animation
   * <MediaPlayer.Loading variant="dots" />
   * ```
   *
   * ```ts
   * // Use spinner animation
   * <MediaPlayer.Loading variant="spinner" />
   * ```
   */
  variant?: "default" | "dots" | "spinner";

  /**
   * Custom content to display in the loading indicator.
   * If not provided, a default spinner and "Loading..." text will be shown.
   *
   * ```tsx
   * // Default loading indicator
   * <MediaPlayer.Loading />
   * ```
   *
   * ```tsx
   * // Custom loading content
   * <MediaPlayer.Loading>
   *   <div className="flex flex-col items-center gap-4">
   *     <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
   *     <p className="text-lg font-semibold">Loading your video...</p>
   *     <p className="text-sm text-muted-foreground">Please wait...</p>
   *   </div>
   * </MediaPlayer.Loading>
   * ```
   */
  children?: React.ReactNode;
}

export interface ResolutionProps
  extends EmptyProps<typeof DropdownMenuTrigger>,
    CompositionProps {
  /**
   * The resolution selector automatically detects available video renditions
   * and provides a dropdown menu to select video quality.
   *
   * Only appears when multiple video renditions are available (e.g., HLS/DASH streams).
   *
   * Features:
   * - Shows current quality in button (e.g., "1080p", "720p", "480p")
   * - Includes "Auto" option for automatic quality selection
   * - Sorts resolutions by quality (highest first)
   * - Uses media-chrome's `mediaRenditionList` state
   *
   * ```tsx
   * // Basic usage - shows when renditions are available
   * <MediaPlayer.Resolution />
   * ```
   *
   * ```tsx
   * // Works with HLS streams
   * <MediaPlayer.Root>
   *   <MediaPlayer.Video src="stream.m3u8" />
   *   <MediaPlayer.Controls>
   *     <MediaPlayer.Resolution />
   *   </MediaPlayer.Controls>
   * </MediaPlayer.Root>
   * ```
   *
   * Supported video formats:
   * - HLS (.m3u8) - HTTP Live Streaming
   * - DASH (.mpd) - Dynamic Adaptive Streaming
   * - Custom media elements with rendition support
   */
}

export interface PlayProps extends EmptyProps<"button">, CompositionProps {}

export interface SeekBackwardProps
  extends EmptyProps<"button">,
    CompositionProps {
  /**
   * The number of seconds to seek backward.
   * @default 5
   *
   * ```ts
   * // Seek backward 5 seconds
   * <MediaPlayer.SeekBackward seconds={5} />
   * ```
   */
  seconds?: number;
}

export interface SeekForwardProps
  extends EmptyProps<"button">,
    CompositionProps {
  /**
   * The number of seconds to seek forward.
   * @default 10
   *
   * ```ts
   * // Seek forward 15 seconds
   * <MediaPlayer.SeekForward seconds={15} />
   * ```
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
   * @default false
   *
   * ```ts
   * // Show time display with seek bar
   * <MediaPlayer.Seek withTime />
   * ```
   */
  withTime?: boolean;

  /**
   * Custom preview thumbnail source for seek preview.
   * Can be a string URL or a function that returns a URL based on time.
   *
   * ```ts
   * // Static thumbnail
   * <MediaPlayer.Seek previewThumbnailSrc="/thumbnail.jpg" />
   * ```
   *
   * ```ts
   * // Dynamic thumbnails
   * <MediaPlayer.Seek
   *   previewThumbnailSrc={(time) => `/thumbnails/${Math.floor(time)}.jpg`}
   * />
   * ```
   */
  previewThumbnailSrc?: string | ((time: number) => string);

  /**
   * Whether to disable preview thumbnails.
   * @default false
   *
   * ```ts
   * // Disable preview thumbnails
   * <MediaPlayer.Seek withoutPreviewThumbnail />
   * ```
   */
  withoutPreviewThumbnail?: boolean;

  /**
   * Whether to disable chapter markers on the seek bar.
   * @default false
   *
   * ```ts
   * // Disable chapter markers
   * <MediaPlayer.Seek withoutChapter />
   * ```
   */
  withoutChapter?: boolean;
}

export interface VolumeProps
  extends Omit<
      React.ComponentProps<typeof Slider>,
      keyof React.ComponentProps<"div">
    >,
    CompositionProps {
  /**
   * Whether the volume slider should expand on hover.
   * @default false
   *
   * ```ts
   * // Expand volume slider on hover
   * <MediaPlayer.Volume expandable />
   * ```
   */
  expandable?: boolean;
}

export interface TimeProps extends EmptyProps<"div">, CompositionProps {
  /**
   * The format mode for displaying time.
   * - `progress`: Shows "currentTime / duration" (e.g., "1:23 / 5:00").
   * - `remaining`: Shows the remaining time (e.g., "3:37").
   * - `duration`: Shows the total duration (e.g., "5:00").
   * @default "progress"
   *
   * ```ts
   * // Show remaining time
   * <MediaPlayer.Time mode="remaining" />
   * ```
   */
  mode?: "progress" | "remaining" | "duration";
}

export interface PlaybackSpeedProps
  extends EmptyProps<typeof SelectTrigger>,
    CompositionProps {
  /**
   * An array of playback speed options.
   * @default [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2]
   *
   * ```ts
   * // Custom playback speeds
   * <MediaPlayer.PlaybackSpeed speeds={[0.5, 1, 1.5, 2]} />
   * ```
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
  extends EmptyProps<typeof DropdownMenuTrigger>,
    CompositionProps {
  /**
   * An array of playback speed options available in the settings menu.
   * @default [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2]
   *
   * ```ts
   * // Custom playback speeds in settings
   * <MediaPlayer.Settings speeds={[0.5, 1, 1.5, 2]} />
   * ```
   */
  speeds?: number[];
}
