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

export interface PlayProps extends EmptyProps<"button">, CompositionProps {}

export interface SeekBackwardProps
  extends EmptyProps<"button">,
    CompositionProps {
  /**
   * The number of seconds to seek backward.
   * @default 10
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
  extends React.ComponentPropsWithoutRef<typeof Slider>,
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
}

export interface VolumeProps
  extends React.ComponentPropsWithoutRef<typeof Slider>,
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
