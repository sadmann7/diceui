"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useComposedRefs } from "@/lib/compose-refs";
import { cn } from "@/lib/utils";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { Slot } from "@radix-ui/react-slot";
import {
  CaptionsOffIcon,
  CastIcon,
  CircleIcon,
  DownloadIcon,
  FastForwardIcon,
  Loader2Icon,
  Maximize2Icon,
  Minimize2Icon,
  MonitorSpeakerIcon,
  PauseIcon,
  PictureInPicture2Icon,
  PictureInPictureIcon,
  PlayIcon,
  RepeatIcon,
  RewindIcon,
  SettingsIcon,
  SubtitlesIcon,
  VideoIcon,
  Volume1Icon,
  Volume2Icon,
  VolumeXIcon,
} from "lucide-react";
import {
  MediaActionTypes,
  MediaProvider,
  timeUtils,
  useMediaDispatch,
  useMediaFullscreenRef,
  useMediaRef,
  useMediaSelector,
} from "media-chrome/react/media-store";
import * as React from "react";

const SEEK_AMOUNT_SHORT = 5;
const SEEK_AMOUNT_LONG = 10;
const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

const ROOT_NAME = "MediaPlayer";
const VIDEO_NAME = "MediaPlayerVideo";
const AUDIO_NAME = "MediaPlayerAudio";
const CONTROLS_NAME = "MediaPlayerControls";
const PLAY_NAME = "MediaPlayerPlay";
const SEEK_BACKWARD_NAME = "MediaPlayerSeekBackward";
const SEEK_FORWARD_NAME = "MediaPlayerSeekForward";
const SEEK_NAME = "MediaPlayerSeek";
const VOLUME_NAME = "MediaPlayerVolume";
const TIME_NAME = "MediaPlayerTime";
const PLAYBACK_SPEED_NAME = "MediaPlayerPlaybackSpeed";
const LOOP_NAME = "MediaPlayerLoop";
const FULLSCREEN_NAME = "MediaPlayerFullscreen";
const PIP_NAME = "MediaPlayerPiP";
const CAPTIONS_NAME = "MediaPlayerCaptions";
const DOWNLOAD_NAME = "MediaPlayerDownload";
const SETTINGS_NAME = "MediaPlayerSettings";
const LIVE_NAME = "MediaPlayerLive";
const CAST_NAME = "MediaPlayerCast";
const AIRPLAY_NAME = "MediaPlayerAirPlay";

type Direction = "ltr" | "rtl";

interface SubtitleTrack {
  kind?: string;
  label?: string;
  language?: string;
  id?: string;
  selected?: boolean;
}

const DirectionContext = React.createContext<Direction | undefined>(undefined);

function useDirection(dirProp?: Direction): Direction {
  const contextDir = React.useContext(DirectionContext);
  return dirProp ?? contextDir ?? "ltr";
}

interface MediaPlayerContextValue {
  mediaId: string;
  labelId: string;
  descriptionId: string;
  dir: Direction;
  disabled: boolean;
  isVideo: boolean;
  mediaRef: React.RefObject<HTMLVideoElement | HTMLAudioElement | null>;
}

const MediaPlayerContext = React.createContext<MediaPlayerContextValue | null>(
  null,
);

function useMediaPlayerContext(consumerName: string) {
  const context = React.useContext(MediaPlayerContext);
  if (!context) {
    throw new Error(`\`${consumerName}\` must be used within \`${ROOT_NAME}\``);
  }
  return context;
}

interface MediaPlayerRootProps
  extends Omit<React.ComponentProps<"div">, "onTimeUpdate" | "onVolumeChange"> {
  onPlay?: () => void;
  onPause?: () => void;
  onEnded?: () => void;
  onTimeUpdate?: (time: number) => void;
  onVolumeChange?: (volume: number) => void;
  onMuted?: (muted: boolean) => void;
  onPipError?: (error: unknown, mode: "enter" | "exit") => void;
  onFullscreenChange?: (fullscreen: boolean) => void;
  onCastError?: (error: unknown, mode: "enter" | "exit") => void;
  onAirPlayError?: (error: unknown) => void;
  dir?: Direction;
  label?: string;
  asChild?: boolean;
  disabled?: boolean;
  isLive?: boolean;
}

function MediaPlayerRoot(props: MediaPlayerRootProps) {
  return (
    <MediaProvider>
      <MediaPlayerRootImpl {...props} />
    </MediaProvider>
  );
}

function MediaPlayerRootImpl({
  onPlay: onPlayProp,
  onPause: onPauseProp,
  onEnded: onEndedProp,
  onTimeUpdate: onTimeUpdateProp,
  onFullscreenChange: onFullscreenChangeProp,
  onVolumeChange: onVolumeChangeProp,
  onMuted,
  onPipError,
  onCastError,
  onAirPlayError,
  asChild,
  disabled = false,
  dir: dirProp,
  label,
  isLive = false,
  children,
  className,
  ...rootImplProps
}: MediaPlayerRootProps) {
  const mediaId = React.useId();
  const labelId = React.useId();
  const descriptionId = React.useId();

  const dispatch = useMediaDispatch();
  const fullscreenRefCallback = useMediaFullscreenRef();

  const mediaRef = React.useRef<HTMLVideoElement | HTMLAudioElement | null>(
    null,
  );

  const dir = useDirection(dirProp);

  const isVideo = React.useMemo(() => {
    if (typeof window === "undefined") return false;
    return mediaRef.current instanceof HTMLVideoElement;
  }, []);

  const contextValue = React.useMemo<MediaPlayerContextValue>(
    () => ({
      mediaId,
      labelId,
      descriptionId,
      dir,
      disabled,
      isVideo,
      mediaRef,
    }),
    [mediaId, labelId, descriptionId, dir, disabled, isVideo],
  );

  React.useEffect(() => {
    const media = mediaRef.current;
    if (!media) return;

    const onPlay = () => onPlayProp?.();
    const onPause = () => onPauseProp?.();
    const onEnded = () => onEndedProp?.();
    const onTimeUpdate = () => onTimeUpdateProp?.(media.currentTime);
    const onVolumeChange = () => {
      onVolumeChangeProp?.(media.volume);
      onMuted?.(media.muted);
    };

    media.addEventListener("play", onPlay);
    media.addEventListener("pause", onPause);
    media.addEventListener("ended", onEnded);
    media.addEventListener("timeupdate", onTimeUpdate);
    media.addEventListener("volumechange", onVolumeChange);

    return () => {
      media.removeEventListener("play", onPlay);
      media.removeEventListener("pause", onPause);
      media.removeEventListener("ended", onEnded);
      media.removeEventListener("timeupdate", onTimeUpdate);
      media.removeEventListener("volumechange", onVolumeChange);
    };
  }, [
    onPlayProp,
    onPauseProp,
    onEndedProp,
    onTimeUpdateProp,
    onVolumeChangeProp,
    onMuted,
  ]);

  React.useEffect(() => {
    if (!onFullscreenChangeProp) return;

    const onFullscreenChange = () => {
      onFullscreenChangeProp(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", onFullscreenChange);
    };
  }, [onFullscreenChangeProp]);

  const onKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (disabled) return;

      rootImplProps.onKeyDown?.(event);

      if (event.defaultPrevented) return;

      const media = mediaRef.current;
      if (!media) return;

      const isMediaFocused = document.activeElement === media;
      const isPlayerFocused =
        document.activeElement?.closest('[data-slot="media-player"]') !== null;

      if (!isMediaFocused && !isPlayerFocused) return;

      switch (event.key.toLowerCase()) {
        case " ":
        case "k":
          event.preventDefault();
          dispatch({
            type: media.paused
              ? MediaActionTypes.MEDIA_PLAY_REQUEST
              : MediaActionTypes.MEDIA_PAUSE_REQUEST,
          });
          break;

        case "f":
          event.preventDefault();
          dispatch({
            type: document.fullscreenElement
              ? MediaActionTypes.MEDIA_EXIT_FULLSCREEN_REQUEST
              : MediaActionTypes.MEDIA_ENTER_FULLSCREEN_REQUEST,
          });
          break;

        case "m": {
          event.preventDefault();
          dispatch({
            type: media.muted
              ? MediaActionTypes.MEDIA_UNMUTE_REQUEST
              : MediaActionTypes.MEDIA_MUTE_REQUEST,
          });
          break;
        }

        case "arrowright":
          event.preventDefault();
          if (
            media instanceof HTMLVideoElement ||
            (media instanceof HTMLAudioElement && event.shiftKey)
          ) {
            dispatch({
              type: MediaActionTypes.MEDIA_SEEK_REQUEST,
              detail: Math.min(
                media.duration,
                media.currentTime + SEEK_AMOUNT_SHORT,
              ),
            });
          }
          break;

        case "arrowleft":
          event.preventDefault();
          if (
            media instanceof HTMLVideoElement ||
            (media instanceof HTMLAudioElement && event.shiftKey)
          ) {
            dispatch({
              type: MediaActionTypes.MEDIA_SEEK_REQUEST,
              detail: Math.max(0, media.currentTime - SEEK_AMOUNT_SHORT),
            });
          }
          break;

        case "arrowup":
          event.preventDefault();
          if (media instanceof HTMLVideoElement) {
            dispatch({
              type: MediaActionTypes.MEDIA_VOLUME_REQUEST,
              detail: Math.min(1, media.volume + 0.1),
            });
          }
          break;

        case "arrowdown":
          event.preventDefault();
          if (media instanceof HTMLVideoElement) {
            dispatch({
              type: MediaActionTypes.MEDIA_VOLUME_REQUEST,
              detail: Math.max(0, media.volume - 0.1),
            });
          }
          break;

        case "<": {
          event.preventDefault();
          const currentRate = media.playbackRate;
          const currentIndex = SPEEDS.indexOf(currentRate);
          const newIndex = Math.max(0, currentIndex - 1);
          const newRate = SPEEDS[newIndex] ?? 1;
          dispatch({
            type: MediaActionTypes.MEDIA_PLAYBACK_RATE_REQUEST,
            detail: newRate,
          });
          break;
        }

        case ">": {
          event.preventDefault();
          const currentRate = media.playbackRate;
          const currentIndex = SPEEDS.indexOf(currentRate);
          const newIndex = Math.min(SPEEDS.length - 1, currentIndex + 1);
          const newRate = SPEEDS[newIndex] ?? 1;
          dispatch({
            type: MediaActionTypes.MEDIA_PLAYBACK_RATE_REQUEST,
            detail: newRate,
          });
          break;
        }

        case "c":
          event.preventDefault();
          if (
            media instanceof HTMLVideoElement &&
            media.textTracks.length > 0
          ) {
            dispatch({
              type: MediaActionTypes.MEDIA_TOGGLE_SUBTITLES_REQUEST,
            });
          }
          break;

        case "d": {
          const hasDownload = media.querySelector(
            '[data-slot="media-player-download"]',
          );

          if (!hasDownload) break;

          event.preventDefault();
          if (media.currentSrc) {
            const link = document.createElement("a");
            link.href = media.currentSrc;
            link.download = "";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }
          break;
        }

        case "p": {
          event.preventDefault();
          if (media instanceof HTMLVideoElement) {
            const isPip = document.pictureInPictureElement === media;
            dispatch({
              type: isPip
                ? MediaActionTypes.MEDIA_EXIT_PIP_REQUEST
                : MediaActionTypes.MEDIA_ENTER_PIP_REQUEST,
            });
            if (isPip) {
              document.exitPictureInPicture().catch((error) => {
                onPipError?.(error, "exit");
              });
            } else {
              media.requestPictureInPicture().catch((error) => {
                onPipError?.(error, "enter");
              });
            }
          }
          break;
        }

        case "r": {
          event.preventDefault();
          media.loop = !media.loop;
          break;
        }

        case "j": {
          event.preventDefault();
          if (media instanceof HTMLVideoElement) {
            dispatch({
              type: MediaActionTypes.MEDIA_SEEK_REQUEST,
              detail: Math.max(0, media.currentTime - SEEK_AMOUNT_LONG),
            });
          }
          break;
        }

        case "l": {
          event.preventDefault();
          if (media instanceof HTMLVideoElement) {
            dispatch({
              type: MediaActionTypes.MEDIA_SEEK_REQUEST,
              detail: Math.min(
                media.duration,
                media.currentTime + SEEK_AMOUNT_LONG,
              ),
            });
          }
          break;
        }

        case "0":
        case "1":
        case "2":
        case "3":
        case "4":
        case "5":
        case "6":
        case "7":
        case "8":
        case "9": {
          event.preventDefault();
          if (isLive) break;
          const percent = Number.parseInt(event.key) / 10;
          const seekTime = media.duration * percent;
          dispatch({
            type: MediaActionTypes.MEDIA_SEEK_REQUEST,
            detail: seekTime,
          });
          break;
        }

        case "home": {
          event.preventDefault();
          if (!isLive) {
            dispatch({
              type: MediaActionTypes.MEDIA_SEEK_REQUEST,
              detail: 0,
            });
          }
          break;
        }

        case "end": {
          event.preventDefault();
          if (!isLive) {
            dispatch({
              type: MediaActionTypes.MEDIA_SEEK_REQUEST,
              detail: media.duration,
            });
          }
          break;
        }
      }
    },
    [dispatch, disabled, rootImplProps.onKeyDown, onPipError, isLive],
  );

  const RootPrimitive = asChild ? Slot : "div";

  return (
    <MediaPlayerContext.Provider value={contextValue}>
      <RootPrimitive
        aria-labelledby={labelId}
        aria-describedby={descriptionId}
        aria-disabled={disabled}
        data-disabled={disabled ? "" : undefined}
        data-slot="media-player"
        data-live={isLive ? "" : undefined}
        dir={dir}
        tabIndex={disabled ? undefined : 0}
        onKeyDown={onKeyDown}
        {...rootImplProps}
        ref={fullscreenRefCallback}
        className={cn(
          "relative isolate flex flex-col overflow-hidden rounded-lg bg-background outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
          "[:fullscreen_&]:flex [:fullscreen_&]:h-full [:fullscreen_&]:max-h-screen [:fullscreen_&]:flex-col [:fullscreen_&]:justify-between",
          "[&_[data-slider]::before]:-top-6 [&_[data-slider]::before]:-bottom-2 [&_[data-slider]::before]:absolute [&_[data-slider]::before]:inset-x-0 [&_[data-slider]::before]:z-10 [&_[data-slider]::before]:h-12 [&_[data-slider]::before]:cursor-pointer [&_[data-slider]::before]:content-[''] [&_[data-slider]]:relative",
          className,
        )}
      >
        <span id={labelId} className="sr-only">
          {label ?? "Media player"}
        </span>
        {children}
      </RootPrimitive>
    </MediaPlayerContext.Provider>
  );
}

interface MediaPlayerVideoProps extends React.ComponentProps<"video"> {
  asChild?: boolean;
}

function MediaPlayerVideo(props: MediaPlayerVideoProps) {
  const { asChild, children, className, ...videoProps } = props;

  const context = useMediaPlayerContext(VIDEO_NAME);
  const dispatch = useMediaDispatch();
  const mediaRefCallback = useMediaRef();
  const composedRef = useComposedRefs(context.mediaRef, mediaRefCallback);

  const onPlayToggle = React.useCallback(
    (event: React.MouseEvent<HTMLVideoElement>) => {
      props.onClick?.(event);

      if (event.defaultPrevented) return;

      const media = event.currentTarget;
      if (!media) return;

      dispatch({
        type: media.paused
          ? MediaActionTypes.MEDIA_PLAY_REQUEST
          : MediaActionTypes.MEDIA_PAUSE_REQUEST,
      });
    },
    [dispatch, props.onClick],
  );

  const VideoPrimitive = asChild ? Slot : "video";

  return (
    <VideoPrimitive
      aria-labelledby={context.labelId}
      aria-describedby={context.descriptionId}
      data-slot="media-player-video"
      controlsList="nodownload noremoteplayback"
      {...videoProps}
      id={context.mediaId}
      ref={composedRef}
      playsInline
      preload="metadata"
      className={cn("h-full w-full cursor-pointer", className)}
      onClick={onPlayToggle}
    >
      {children}
      <span id={context.descriptionId} className="sr-only">
        Video player with custom controls for playback, volume, seeking, and
        more. Use space bar to play/pause, arrow keys (←/→) to seek, and arrow
        keys (↑/↓) to adjust volume.
      </span>
    </VideoPrimitive>
  );
}

interface MediaPlayerAudioProps extends React.ComponentProps<"audio"> {
  asChild?: boolean;
}

function MediaPlayerAudio(props: MediaPlayerAudioProps) {
  const { asChild, children, className, ...audioProps } = props;

  const context = useMediaPlayerContext(AUDIO_NAME);
  const mediaRefCallback = useMediaRef();
  const composedRef = useComposedRefs(context.mediaRef, mediaRefCallback);

  const AudioPrimitive = asChild ? Slot : "audio";

  return (
    <AudioPrimitive
      aria-labelledby={context.labelId}
      aria-describedby={context.descriptionId}
      data-slot="media-player-audio"
      {...audioProps}
      id={context.mediaId}
      ref={composedRef}
      preload="metadata"
      className={cn("w-full", className)}
    >
      {children}
      <span id={context.descriptionId} className="sr-only">
        Audio player with custom controls for playback, volume, seeking, and
        more. Use space bar to play/pause, Shift + arrow keys (←/→) to seek, and
        arrow keys (↑/↓) to adjust volume.
      </span>
    </AudioPrimitive>
  );
}

interface MediaPlayerControlsProps extends React.ComponentProps<"div"> {
  asChild?: boolean;
}

function MediaPlayerControls(props: MediaPlayerControlsProps) {
  const { asChild, className, ...controlsProps } = props;

  const context = useMediaPlayerContext(CONTROLS_NAME);
  const isFullscreen = useMediaSelector((state) => state.mediaIsFullscreen);

  const ControlsPrimitive = asChild ? Slot : "div";

  return (
    <ControlsPrimitive
      role="group"
      aria-label="Media controls"
      data-disabled={context.disabled ? "" : undefined}
      data-slot="media-player-controls"
      data-state={isFullscreen ? "fullscreen" : "windowed"}
      dir={context.dir}
      className={cn(
        "dark absolute right-0 bottom-0 left-0 z-50 flex items-center gap-2 px-4 py-3",
        "[:fullscreen_&]:absolute [:fullscreen_&]:right-0 [:fullscreen_&]:bottom-0 [:fullscreen_&]:left-0 [:fullscreen_&]:z-50 [:fullscreen_&]:px-6 [:fullscreen_&]:py-4",
        className,
      )}
      {...controlsProps}
    />
  );
}

interface MediaPlayerOverlayProps extends React.ComponentProps<"div"> {
  asChild?: boolean;
}

function MediaPlayerOverlay(props: MediaPlayerOverlayProps) {
  const { asChild, className, ...overlayProps } = props;

  const isFullscreen = useMediaSelector((state) => state.mediaIsFullscreen);

  const OverlayPrimitive = asChild ? Slot : "div";

  return (
    <OverlayPrimitive
      data-state={isFullscreen ? "fullscreen" : "windowed"}
      data-slot="media-player-overlay"
      {...overlayProps}
      className={cn(
        "-z-10 absolute inset-0 bg-gradient-to-t from-black/80 to-transparent",
        className,
      )}
    />
  );
}

interface MediaPlayerLoadingProps extends React.ComponentProps<"div"> {
  asChild?: boolean;
  delay?: number;
  variant?: "default" | "dots" | "spinner";
}

function MediaPlayerLoading(props: MediaPlayerLoadingProps) {
  const {
    asChild,
    variant = "default",
    delay = 500,
    className,
    ...loadingProps
  } = props;

  const isLoading = useMediaSelector((state) => state.mediaLoading);
  const isPaused = useMediaSelector((state) => state.mediaPaused);
  const hasPlayed = useMediaSelector((state) => state.mediaHasPlayed);

  const [shouldRender, setShouldRender] = React.useState(false);
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  React.useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    const shouldShowLoading = isLoading && !isPaused;

    if (shouldShowLoading) {
      const loadingDelay = hasPlayed ? delay : 0;

      if (loadingDelay > 0) {
        timeoutRef.current = setTimeout(() => {
          setShouldRender(true);
          timeoutRef.current = null;
        }, loadingDelay);
      } else {
        setShouldRender(true);
      }
    } else {
      setShouldRender(false);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [isLoading, isPaused, hasPlayed, delay]);

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const getLoadingIcon = React.useCallback(() => {
    switch (variant) {
      case "dots":
        return (
          <div className="flex items-center gap-1">
            <div className="size-3 animate-bounce rounded-full bg-primary [animation-delay:-0.3s]" />
            <div className="size-3 animate-bounce rounded-full bg-primary [animation-delay:-0.15s]" />
            <div className="size-3 animate-bounce rounded-full bg-primary" />
          </div>
        );

      case "spinner":
        return (
          <svg
            className="size-12 animate-spin text-primary"
            viewBox="0 0 100 100"
            fill="none"
          >
            <path
              d="M73,50c0-12.7-10.3-23-23-23S27,37.3,27,50 M30.9,50c0-10.5,8.5-19.1,19.1-19.1S69.1,39.5,69.1,50"
              stroke="currentColor"
              strokeWidth="8"
              strokeLinecap="round"
            />
          </svg>
        );

      default:
        return <Loader2Icon className="size-12 animate-spin text-primary" />;
    }
  }, [variant]);

  if (!shouldRender) return null;

  const LoadingPrimitive = asChild ? Slot : "div";

  return (
    <LoadingPrimitive
      role="status"
      aria-label="Loading media"
      aria-live="polite"
      data-loading={isLoading ? "" : undefined}
      data-paused={isPaused ? "" : undefined}
      data-slot="media-player-loading"
      data-variant={variant}
      {...loadingProps}
      className={cn(
        "absolute inset-0 z-40 flex items-center justify-center",
        "bg-black/10 backdrop-blur-[2px]",
        "transition-opacity duration-150 ease-in-out",
        "[:fullscreen_&]:z-50",
        className,
      )}
    >
      {getLoadingIcon()}
    </LoadingPrimitive>
  );
}

interface MediaPlayerPlayProps extends React.ComponentProps<typeof Button> {}

function MediaPlayerPlay(props: MediaPlayerPlayProps) {
  const { asChild, children, className, disabled, ...playButtonProps } = props;

  const context = useMediaPlayerContext(PLAY_NAME);
  const dispatch = useMediaDispatch();
  const mediaPaused = useMediaSelector(
    (state) => typeof state.mediaPaused !== "boolean" || state.mediaPaused,
  );

  const isDisabled = disabled || context.disabled;

  const onPlayToggle = React.useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      props.onClick?.(event);

      if (event.defaultPrevented) return;

      dispatch({
        type: mediaPaused
          ? MediaActionTypes.MEDIA_PLAY_REQUEST
          : MediaActionTypes.MEDIA_PAUSE_REQUEST,
      });
    },
    [dispatch, props.onClick, mediaPaused],
  );

  return (
    <MediaPlayerTooltip
      tooltip={mediaPaused ? "Play" : "Pause"}
      shortcut="Space"
    >
      <Button
        type="button"
        aria-label={mediaPaused ? "Play" : "Pause"}
        aria-pressed={!mediaPaused}
        aria-controls={context.mediaId}
        data-disabled={isDisabled ? "" : undefined}
        data-state={mediaPaused ? "paused" : "playing"}
        data-slot="media-player-play-button"
        disabled={isDisabled}
        {...playButtonProps}
        variant="ghost"
        size="icon"
        className={cn(
          "size-8 [&_svg:not([class*='fill-'])]:fill-current",
          className,
        )}
        onClick={onPlayToggle}
      >
        {children ?? (mediaPaused ? <PlayIcon /> : <PauseIcon />)}
      </Button>
    </MediaPlayerTooltip>
  );
}

interface MediaPlayerSeekBackwardProps
  extends React.ComponentProps<typeof Button> {
  seconds?: number;
}

function MediaPlayerSeekBackward(props: MediaPlayerSeekBackwardProps) {
  const {
    asChild,
    children,
    className,
    seconds = SEEK_AMOUNT_SHORT,
    ...seekBackwardProps
  } = props;

  const context = useMediaPlayerContext(SEEK_BACKWARD_NAME);
  const dispatch = useMediaDispatch();
  const mediaCurrentTime = useMediaSelector(
    (state) => state.mediaCurrentTime ?? 0,
  );

  const isDisabled = props.disabled || context.disabled;

  const onSeekBackward = React.useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      props.onClick?.(event);

      if (event.defaultPrevented) return;

      dispatch({
        type: MediaActionTypes.MEDIA_SEEK_REQUEST,
        detail: Math.max(0, mediaCurrentTime - seconds),
      });
    },
    [dispatch, props.onClick, mediaCurrentTime, seconds],
  );

  return (
    <MediaPlayerTooltip
      tooltip={`Back ${seconds}s`}
      shortcut={context.isVideo ? ["←"] : ["Shift ←"]}
    >
      <Button
        type="button"
        aria-label={`Back ${seconds} seconds`}
        aria-controls={context.mediaId}
        data-disabled={isDisabled ? "" : undefined}
        data-slot="media-player-seek-backward"
        disabled={isDisabled}
        {...seekBackwardProps}
        variant="ghost"
        size="icon"
        className={cn("size-8", className)}
        onClick={onSeekBackward}
      >
        {children ?? <RewindIcon />}
      </Button>
    </MediaPlayerTooltip>
  );
}

interface MediaPlayerSeekForwardProps
  extends React.ComponentProps<typeof Button> {
  seconds?: number;
}

function MediaPlayerSeekForward(props: MediaPlayerSeekForwardProps) {
  const {
    asChild,
    children,
    className,
    seconds = SEEK_AMOUNT_LONG,
    ...seekForwardProps
  } = props;

  const context = useMediaPlayerContext(SEEK_FORWARD_NAME);
  const dispatch = useMediaDispatch();
  const mediaCurrentTime = useMediaSelector(
    (state) => state.mediaCurrentTime ?? 0,
  );
  const [, seekableEnd] =
    useMediaSelector((state) => state.mediaSeekable) ?? [];
  const isDisabled = props.disabled || context.disabled;

  const onSeekForward = React.useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      props.onClick?.(event);

      if (event.defaultPrevented) return;

      dispatch({
        type: MediaActionTypes.MEDIA_SEEK_REQUEST,
        detail: Math.min(
          seekableEnd ?? Number.POSITIVE_INFINITY,
          mediaCurrentTime + seconds,
        ),
      });
    },
    [dispatch, props.onClick, mediaCurrentTime, seekableEnd, seconds],
  );

  return (
    <MediaPlayerTooltip
      tooltip={`Forward ${seconds}s`}
      shortcut={context.isVideo ? ["→"] : ["Shift →"]}
    >
      <Button
        type="button"
        aria-label={`Forward ${seconds} seconds`}
        aria-controls={context.mediaId}
        data-disabled={isDisabled ? "" : undefined}
        data-slot="media-player-seek-forward"
        disabled={isDisabled}
        {...seekForwardProps}
        variant="ghost"
        size="icon"
        className={cn("size-8", className)}
        onClick={onSeekForward}
      >
        {children ?? <FastForwardIcon />}
      </Button>
    </MediaPlayerTooltip>
  );
}

interface MediaPlayerSeekProps
  extends React.ComponentProps<typeof SliderPrimitive.Root> {
  withTime?: boolean;
}

function MediaPlayerSeek(props: MediaPlayerSeekProps) {
  const { withTime = false, className, disabled, ...seekProps } = props;

  const context = useMediaPlayerContext(SEEK_NAME);
  const dispatch = useMediaDispatch();
  const mediaCurrentTime = useMediaSelector(
    (state) => state.mediaCurrentTime ?? 0,
  );
  const [seekableStart = 0, seekableEnd = 0] =
    useMediaSelector((state) => state.mediaSeekable) ?? [];
  const mediaBuffered = useMediaSelector((state) => state.mediaBuffered);
  const mediaEnded = useMediaSelector((state) => state.mediaEnded);

  const seekRef = React.useRef<HTMLDivElement>(null);
  const previewBoxRef = React.useRef<HTMLDivElement>(null);

  const [isHoveringSeek, setIsHoveringSeek] = React.useState(false);
  const [hoverTime, setHoverTime] = React.useState(0);
  const [previewPosition, setPreviewPosition] = React.useState({
    x: 0,
    shift: 0,
  });

  const formattedCurrentTime = timeUtils.formatTime(
    mediaCurrentTime,
    seekableEnd,
  );
  const formattedDuration = timeUtils.formatTime(seekableEnd, seekableEnd);
  const formattedHoverTime = timeUtils.formatTime(hoverTime, seekableEnd);
  const formattedRemainingTime = timeUtils.formatTime(
    seekableEnd - mediaCurrentTime,
    seekableEnd,
  );

  const isDisabled = disabled || context.disabled;

  const seekThrottleTimeoutRef = React.useRef<number | null>(null);
  const latestSeekValueRef = React.useRef<number | null>(null);
  const hoverTimeoutRef = React.useRef<number | null>(null);

  const bufferedProgress = React.useMemo(() => {
    if (!mediaBuffered?.length || seekableEnd <= 0) return 0;

    if (mediaEnded) return 1;

    const containingRange = mediaBuffered.find(
      ([start, end]) => start <= mediaCurrentTime && mediaCurrentTime <= end,
    );

    if (containingRange) {
      return Math.min(1, containingRange[1] / seekableEnd);
    }

    return Math.min(1, seekableStart / seekableEnd);
  }, [mediaBuffered, mediaCurrentTime, seekableEnd, mediaEnded, seekableStart]);

  const onPointerEnter = React.useCallback(() => {
    if (seekableEnd > 0) {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
      hoverTimeoutRef.current = window.setTimeout(() => {
        setIsHoveringSeek(true);
      }, 100);
    }
  }, [seekableEnd]);

  const onPointerLeave = React.useCallback(() => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    setIsHoveringSeek(false);
  }, []);

  const onPointerMove = React.useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (!seekRef.current || seekableEnd <= 0) {
        return;
      }

      const seekRect = seekRef.current.getBoundingClientRect();

      const offsetX = event.clientX - seekRect.left;
      const clampedOffsetX = Math.max(0, Math.min(offsetX, seekRect.width));
      const relativeX = clampedOffsetX / seekRect.width;
      const calculatedHoverTime = relativeX * seekableEnd;

      const estimatedPreviewBoxWidth = 80;
      const boxPaddingLeft = 10;
      const boxPaddingRight = 10;

      const positionPercent = relativeX * 100;

      let shift = 0;
      const pointerX = relativeX * seekRect.width;
      const minPos = estimatedPreviewBoxWidth / 2 + boxPaddingLeft;
      const maxPos =
        seekRect.width - estimatedPreviewBoxWidth / 2 - boxPaddingRight;

      if (pointerX < minPos) {
        shift = pointerX - estimatedPreviewBoxWidth / 2 - boxPaddingLeft;
      } else if (pointerX > maxPos) {
        shift =
          pointerX +
          estimatedPreviewBoxWidth / 2 -
          seekRect.width +
          boxPaddingRight;
      }

      setPreviewPosition({ x: positionPercent, shift });
      setHoverTime(calculatedHoverTime);
    },
    [seekableEnd],
  );

  const onSeek = React.useCallback(
    (value: number[]) => {
      const time = value[0] ?? 0;
      latestSeekValueRef.current = time;

      if (seekThrottleTimeoutRef.current) {
        cancelAnimationFrame(seekThrottleTimeoutRef.current);
      }

      seekThrottleTimeoutRef.current = requestAnimationFrame(() => {
        if (latestSeekValueRef.current !== null) {
          dispatch({
            type: MediaActionTypes.MEDIA_SEEK_REQUEST,
            detail: latestSeekValueRef.current,
          });
        }
        seekThrottleTimeoutRef.current = null;
      });
    },
    [dispatch],
  );

  const onSeekCommit = React.useCallback(
    (value: number[]) => {
      const time = value[0] ?? 0;

      if (seekThrottleTimeoutRef.current) {
        cancelAnimationFrame(seekThrottleTimeoutRef.current);
        seekThrottleTimeoutRef.current = null;
      }

      dispatch({
        type: MediaActionTypes.MEDIA_SEEK_REQUEST,
        detail: time,
      });
      latestSeekValueRef.current = null;
    },
    [dispatch],
  );

  React.useEffect(() => {
    return () => {
      if (seekThrottleTimeoutRef.current) {
        cancelAnimationFrame(seekThrottleTimeoutRef.current);
      }
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  const SeekSlider = (
    <div className="relative w-full">
      <SliderPrimitive.Root
        aria-label="Seek time"
        aria-valuetext={`${formattedCurrentTime} of ${formattedDuration}`}
        aria-controls={context.mediaId}
        data-slider=""
        data-slot="media-player-seek"
        disabled={isDisabled}
        {...seekProps}
        ref={seekRef}
        min={seekableStart}
        max={seekableEnd}
        step={0.01}
        className={cn(
          "relative flex w-full touch-none select-none items-center data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
          className,
        )}
        value={[mediaCurrentTime]}
        onValueChange={onSeek}
        onValueCommit={onSeekCommit}
        onPointerMove={onPointerMove}
      >
        <SliderPrimitive.Track
          aria-label="Video progress"
          className="relative h-1 w-full grow overflow-hidden rounded-full bg-zinc-500"
        >
          <div
            data-slot="media-player-seek-buffered"
            className="absolute h-full bg-zinc-400"
            style={{
              width: `${bufferedProgress * 100}%`,
            }}
          />
          <SliderPrimitive.Range
            aria-label="Current progress"
            className="absolute h-full bg-primary"
          />
        </SliderPrimitive.Track>
        <SliderPrimitive.Thumb
          aria-label="Seek thumb"
          className="relative z-10 block size-2.5 shrink-0 rounded-full bg-primary shadow-sm ring-ring/50 transition-[color,box-shadow] hover:ring-4 focus-visible:outline-hidden focus-visible:ring-4 disabled:pointer-events-none disabled:opacity-50"
        />
      </SliderPrimitive.Root>
      {isHoveringSeek && seekableEnd > 0 && (
        <div
          className="pointer-events-none absolute bottom-full z-50 mb-2"
          style={{
            left: `${previewPosition.x}%`,
            transform: `translateX(calc(-50% + ${previewPosition.shift}px))`,
          }}
        >
          <div
            ref={previewBoxRef}
            className="rounded border bg-accent px-2 py-1 text-accent-foreground text-xs tabular-nums shadow-lg dark:bg-zinc-900"
          >
            {formattedHoverTime} / {formattedDuration}
          </div>
        </div>
      )}
    </div>
  );

  const SeekWrapper = (
    <div
      role="presentation"
      data-slot="media-player-seek-wrapper"
      className={cn("relative w-full", className)}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
    >
      {SeekSlider}
    </div>
  );

  if (withTime) {
    return (
      <div
        role="group"
        aria-label="Video progress"
        className="flex w-full items-center gap-2"
      >
        <span aria-label="Current time" className="text-sm tabular-nums">
          {formattedCurrentTime}
        </span>
        {SeekWrapper}
        <span aria-label="Remaining time" className="text-sm tabular-nums">
          {formattedRemainingTime}
        </span>
      </div>
    );
  }

  return SeekWrapper;
}

interface MediaPlayerVolumeProps
  extends React.ComponentProps<typeof SliderPrimitive.Root> {
  asChild?: boolean;
  expandable?: boolean;
}

function MediaPlayerVolume(props: MediaPlayerVolumeProps) {
  const {
    asChild,
    expandable = false,
    className,
    disabled,
    ...volumeProps
  } = props;

  const context = useMediaPlayerContext(VOLUME_NAME);
  const dispatch = useMediaDispatch();
  const mediaVolume = useMediaSelector((state) => state.mediaVolume ?? 1);
  const mediaMuted = useMediaSelector((state) => state.mediaMuted);
  const mediaVolumeLevel = useMediaSelector((state) => state.mediaVolumeLevel);

  const volumeTriggerId = React.useId();
  const sliderId = React.useId();

  const isDisabled = disabled || context.disabled;

  const onVolumeChange = React.useCallback(
    (value: number[]) => {
      const volume = value[0] ?? 0;
      dispatch({
        type: MediaActionTypes.MEDIA_VOLUME_REQUEST,
        detail: volume,
      });
    },
    [dispatch],
  );

  const onMute = React.useCallback(() => {
    dispatch({
      type: mediaMuted
        ? MediaActionTypes.MEDIA_UNMUTE_REQUEST
        : MediaActionTypes.MEDIA_MUTE_REQUEST,
    });
  }, [dispatch, mediaMuted]);

  const effectiveVolume = mediaMuted ? 0 : mediaVolume;

  return (
    <div
      role="group"
      aria-label="Volume controls"
      data-disabled={isDisabled ? "" : undefined}
      className={cn(
        "group flex items-center",
        expandable ? "gap-0 group-hover:gap-2" : "gap-2",
        className,
      )}
    >
      <MediaPlayerTooltip tooltip="Volume" shortcut="M">
        <Button
          id={volumeTriggerId}
          type="button"
          aria-label={mediaMuted ? "Unmute" : "Mute"}
          aria-pressed={mediaMuted}
          aria-controls={`${context.mediaId} ${sliderId}`}
          data-state={mediaMuted ? "muted" : "unmuted"}
          data-slot="media-player-mute"
          variant="ghost"
          size="icon"
          className="size-8"
          disabled={isDisabled}
          onClick={onMute}
        >
          {mediaVolumeLevel === "off" || mediaMuted ? (
            <VolumeXIcon />
          ) : mediaVolumeLevel === "high" ? (
            <Volume2Icon />
          ) : (
            <Volume1Icon />
          )}
        </Button>
      </MediaPlayerTooltip>
      <SliderPrimitive.Root
        id={sliderId}
        aria-label="Volume"
        aria-controls={context.mediaId}
        aria-valuetext={`${Math.round(effectiveVolume * 100)}% volume`}
        data-slider=""
        data-slot="media-player-volume"
        {...volumeProps}
        min={0}
        max={1}
        step={0.1}
        className={cn(
          "relative flex touch-none select-none items-center",
          expandable
            ? "w-0 opacity-0 transition-[width,opacity] duration-200 ease-in-out group-hover:w-16 group-hover:opacity-100"
            : "w-16",
          className,
        )}
        disabled={isDisabled}
        value={[effectiveVolume]}
        onValueChange={onVolumeChange}
      >
        <SliderPrimitive.Track
          aria-label="Volume track"
          className="relative h-1 w-full grow overflow-hidden rounded-full bg-zinc-500"
        >
          <SliderPrimitive.Range
            aria-label="Current volume"
            className="absolute h-full bg-primary"
          />
        </SliderPrimitive.Track>
        <SliderPrimitive.Thumb
          aria-label="Volume thumb"
          className="block size-2.5 shrink-0 rounded-full bg-primary shadow-sm ring-ring/50 transition-[color,box-shadow] hover:ring-4 focus-visible:outline-hidden focus-visible:ring-4 disabled:pointer-events-none disabled:opacity-50"
        />
      </SliderPrimitive.Root>
    </div>
  );
}

interface MediaPlayerTimeProps extends React.ComponentProps<"div"> {
  asChild?: boolean;
  mode?: "progress" | "remaining" | "duration";
}

function MediaPlayerTime(props: MediaPlayerTimeProps) {
  const { asChild, className, mode = "progress", ...timeProps } = props;

  const context = useMediaPlayerContext(TIME_NAME);
  const mediaCurrentTime = useMediaSelector(
    (state) => state.mediaCurrentTime ?? 0,
  );
  const [, seekableEnd = 0] =
    useMediaSelector((state) => state.mediaSeekable) ?? [];

  const formattedCurrentTime = timeUtils.formatTime(
    mediaCurrentTime,
    seekableEnd,
  );
  const formattedDuration = timeUtils.formatTime(seekableEnd, seekableEnd);
  const formattedRemainingTime = timeUtils.formatTime(
    seekableEnd - mediaCurrentTime,
    seekableEnd,
  );

  const TimePrimitive = asChild ? Slot : "div";

  if (mode === "remaining" || mode === "duration") {
    return (
      <TimePrimitive
        aria-label={mode === "remaining" ? "Remaining time" : "Duration"}
        data-slot="media-player-time"
        dir={context.dir}
        {...timeProps}
        className={cn("text-foreground/80 text-sm tabular-nums", className)}
      >
        {mode === "remaining" ? formattedRemainingTime : formattedDuration}
      </TimePrimitive>
    );
  }

  return (
    <TimePrimitive
      aria-label="Time"
      data-slot="media-player-time"
      dir={context.dir}
      {...timeProps}
      className={cn(
        "flex items-center gap-1 text-foreground/80 text-sm",
        className,
      )}
    >
      <span aria-label="Current time" className="tabular-nums">
        {formattedCurrentTime}
      </span>
      <span role="presentation" aria-hidden="true">
        /
      </span>
      <span aria-label="Duration" className="tabular-nums">
        {formattedDuration}
      </span>
    </TimePrimitive>
  );
}

interface MediaPlayerPlaybackSpeedProps
  extends React.ComponentProps<typeof SelectTrigger> {
  speeds?: number[];
}

function MediaPlayerPlaybackSpeed(props: MediaPlayerPlaybackSpeedProps) {
  const {
    asChild,
    speeds = SPEEDS,
    className,
    disabled,
    ...playbackSpeedProps
  } = props;

  const context = useMediaPlayerContext(PLAYBACK_SPEED_NAME);
  const dispatch = useMediaDispatch();
  const mediaPlaybackRate = useMediaSelector(
    (state) => state.mediaPlaybackRate ?? 1,
  );

  const isDisabled = disabled || context.disabled;

  const onPlaybackRateChange = React.useCallback(
    (value: string) => {
      const rate = Number.parseFloat(value);
      dispatch({
        type: MediaActionTypes.MEDIA_PLAYBACK_RATE_REQUEST,
        detail: rate,
      });
    },
    [dispatch],
  );

  return (
    <Select
      data-slot="media-player-playback-speed"
      value={mediaPlaybackRate.toString()}
      onValueChange={onPlaybackRateChange}
    >
      <MediaPlayerTooltip tooltip="Playback speed" shortcut={["<", ">"]}>
        <SelectTrigger
          aria-controls={context.mediaId}
          disabled={isDisabled}
          {...playbackSpeedProps}
          className={cn(
            "h-8 w-16 justify-center border-none aria-expanded:bg-accent aria-[expanded=true]:bg-accent/50 dark:bg-transparent dark:aria-[expanded=true]:bg-accent/50 dark:hover:bg-accent/50 [&[data-size]]:h-8 [&_svg]:hidden",
            className,
          )}
        >
          <SelectValue>{mediaPlaybackRate}x</SelectValue>
        </SelectTrigger>
      </MediaPlayerTooltip>
      <SelectContent
        align="center"
        className="min-w-[var(--radix-select-trigger-width)]"
      >
        {speeds.map((speed) => (
          <SelectItem key={speed} value={speed.toString()}>
            {speed}x
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

interface MediaPlayerLoopProps extends React.ComponentProps<typeof Button> {}

function MediaPlayerLoop(props: MediaPlayerLoopProps) {
  const { children, className, ...loopProps } = props;

  const context = useMediaPlayerContext(LOOP_NAME);
  const [isLooping, setIsLooping] = React.useState(false);
  const isDisabled = props.disabled || context.disabled;

  React.useEffect(() => {
    const mediaElement = context.mediaRef.current;
    if (mediaElement) {
      setIsLooping(mediaElement.loop);
      const checkLoop = () => setIsLooping(mediaElement.loop);

      const observer = new MutationObserver(checkLoop);
      observer.observe(mediaElement, {
        attributes: true,
        attributeFilter: ["loop"],
      });
      return () => observer.disconnect();
    }
  }, [context.mediaRef]);

  const onLoopToggle = React.useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      props.onClick?.(event);
      if (event.defaultPrevented) return;

      const mediaElement = context.mediaRef.current;
      if (mediaElement) {
        mediaElement.loop = !mediaElement.loop;
        setIsLooping(mediaElement.loop);
      }
    },
    [context.mediaRef, props.onClick],
  );

  return (
    <MediaPlayerTooltip
      tooltip={isLooping ? "Disable loop" : "Enable loop"}
      shortcut="R"
    >
      <Button
        type="button"
        aria-label={isLooping ? "Disable loop" : "Enable loop"}
        aria-controls={context.mediaId}
        aria-pressed={isLooping}
        data-disabled={isDisabled ? "" : undefined}
        data-state={isLooping ? "looping" : "not-looping"}
        data-slot="media-player-loop"
        disabled={isDisabled}
        {...loopProps}
        variant="ghost"
        size="icon"
        className={cn("size-8", className)}
        onClick={onLoopToggle}
      >
        {children ??
          (isLooping ? (
            <RepeatIcon className={cn("text-foreground/60")} />
          ) : (
            <RepeatIcon />
          ))}
      </Button>
    </MediaPlayerTooltip>
  );
}

interface MediaPlayerFullscreenProps
  extends React.ComponentProps<typeof Button> {}

function MediaPlayerFullscreen(props: MediaPlayerFullscreenProps) {
  const { children, className, disabled, ...fullscreenProps } = props;

  const context = useMediaPlayerContext(FULLSCREEN_NAME);
  const dispatch = useMediaDispatch();
  const isFullscreen = useMediaSelector((state) => state.mediaIsFullscreen);

  const isDisabled = disabled || context.disabled;

  const onFullscreen = React.useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      props.onClick?.(event);

      if (event.defaultPrevented) return;

      dispatch({
        type: isFullscreen
          ? MediaActionTypes.MEDIA_EXIT_FULLSCREEN_REQUEST
          : MediaActionTypes.MEDIA_ENTER_FULLSCREEN_REQUEST,
      });
    },
    [dispatch, props.onClick, isFullscreen],
  );

  return (
    <MediaPlayerTooltip tooltip="Fullscreen" shortcut="F">
      <Button
        type="button"
        aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
        data-disabled={isDisabled ? "" : undefined}
        data-state={isFullscreen ? "fullscreen" : "windowed"}
        data-slot="media-player-fullscreen"
        disabled={isDisabled}
        {...fullscreenProps}
        variant="ghost"
        size="icon"
        className={cn("size-8", className)}
        onClick={onFullscreen}
      >
        {children ?? (isFullscreen ? <Minimize2Icon /> : <Maximize2Icon />)}
      </Button>
    </MediaPlayerTooltip>
  );
}

interface MediaPlayerPiPProps extends React.ComponentProps<typeof Button> {
  onPipError?: (error: unknown, mode: "enter" | "exit") => void;
}

function MediaPlayerPiP(props: MediaPlayerPiPProps) {
  const { children, className, onPipError, disabled, ...pipButtonProps } =
    props;

  const context = useMediaPlayerContext(PIP_NAME);
  const dispatch = useMediaDispatch();
  const isPictureInPicture = useMediaSelector((state) => state.mediaIsPip);

  const isDisabled = disabled || context.disabled;

  const onPictureInPicture = React.useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      props.onClick?.(event);

      if (event.defaultPrevented) return;

      dispatch({
        type: isPictureInPicture
          ? MediaActionTypes.MEDIA_EXIT_PIP_REQUEST
          : MediaActionTypes.MEDIA_ENTER_PIP_REQUEST,
      });

      const mediaElement = context.mediaRef.current;

      if (mediaElement instanceof HTMLVideoElement) {
        if (isPictureInPicture) {
          document.exitPictureInPicture().catch((error) => {
            onPipError?.(error, "exit");
          });
        } else {
          mediaElement.requestPictureInPicture().catch((error) => {
            onPipError?.(error, "enter");
          });
        }
      }
    },
    [dispatch, props.onClick, isPictureInPicture, onPipError, context.mediaRef],
  );

  return (
    <MediaPlayerTooltip tooltip="Picture in picture" shortcut="P">
      <Button
        type="button"
        aria-label={isPictureInPicture ? "Exit pip" : "Enter pip"}
        data-disabled={isDisabled ? "" : undefined}
        data-state={isPictureInPicture ? "pip" : "inline"}
        data-slot="media-player-pip"
        disabled={isDisabled}
        {...pipButtonProps}
        variant="ghost"
        size="icon"
        className={cn("size-8", className)}
        onClick={onPictureInPicture}
      >
        {isPictureInPicture ? (
          <PictureInPicture2Icon />
        ) : (
          <PictureInPictureIcon />
        )}
      </Button>
    </MediaPlayerTooltip>
  );
}

interface MediaPlayerCaptionsProps
  extends React.ComponentProps<typeof Button> {}

function MediaPlayerCaptions(props: MediaPlayerCaptionsProps) {
  const { children, className, disabled, ...captionsProps } = props;

  const context = useMediaPlayerContext(CAPTIONS_NAME);
  const dispatch = useMediaDispatch();
  const showingSubtitles = useMediaSelector(
    (state) => !!state.mediaSubtitlesShowing?.length,
  );

  const isDisabled = disabled || context.disabled;

  const onToggleCaptions = React.useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      props.onClick?.(event);

      if (event.defaultPrevented) return;

      dispatch({
        type: MediaActionTypes.MEDIA_TOGGLE_SUBTITLES_REQUEST,
      });
    },
    [dispatch, props.onClick],
  );

  return (
    <MediaPlayerTooltip tooltip="Captions" shortcut="C">
      <Button
        type="button"
        aria-label={showingSubtitles ? "Disable captions" : "Enable captions"}
        aria-controls={context.mediaId}
        aria-pressed={showingSubtitles}
        data-state={showingSubtitles ? "active" : "inactive"}
        data-disabled={isDisabled ? "" : undefined}
        data-slot="media-player-captions"
        disabled={isDisabled}
        {...captionsProps}
        variant="ghost"
        size="icon"
        className={cn("size-8", className)}
        onClick={onToggleCaptions}
      >
        {children ??
          (showingSubtitles ? <SubtitlesIcon /> : <CaptionsOffIcon />)}
      </Button>
    </MediaPlayerTooltip>
  );
}

interface MediaPlayerDownloadProps
  extends React.ComponentProps<typeof Button> {}

function MediaPlayerDownload(props: MediaPlayerDownloadProps) {
  const { children, className, disabled, ...downloadProps } = props;

  const context = useMediaPlayerContext(DOWNLOAD_NAME);

  const isDisabled = disabled || context.disabled;

  const onDownload = React.useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      props.onClick?.(event);

      if (event.defaultPrevented) return;

      const mediaElement = context.mediaRef.current;

      if (!mediaElement || !mediaElement.currentSrc) return;

      const link = document.createElement("a");
      link.href = mediaElement.currentSrc;
      link.download = "";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },
    [context.mediaRef, props.onClick],
  );

  return (
    <MediaPlayerTooltip tooltip="Download" shortcut="D">
      <Button
        type="button"
        aria-label="Download"
        aria-controls={context.mediaId}
        data-disabled={isDisabled ? "" : undefined}
        data-slot="media-player-download"
        disabled={isDisabled}
        {...downloadProps}
        variant="ghost"
        size="icon"
        className={cn("size-8", className)}
        onClick={onDownload}
      >
        {children ?? <DownloadIcon />}
      </Button>
    </MediaPlayerTooltip>
  );
}

interface MediaPlayerLiveProps extends React.ComponentProps<typeof Button> {}

function MediaPlayerLive(props: MediaPlayerLiveProps) {
  const { children, className, disabled, ...liveProps } = props;

  const context = useMediaPlayerContext(LIVE_NAME);
  const dispatch = useMediaDispatch();
  const [, seekableEnd = 0] =
    useMediaSelector((state) => state.mediaSeekable) ?? [];
  const mediaCurrentTime = useMediaSelector(
    (state) => state.mediaCurrentTime ?? 0,
  );

  const isDisabled = disabled || context.disabled;
  const isLive = seekableEnd === Number.POSITIVE_INFINITY;
  const isAtLiveEdge = isLive && Math.abs(seekableEnd - mediaCurrentTime) < 30;

  const onSeekToLive = React.useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      props.onClick?.(event);

      if (event.defaultPrevented) return;

      dispatch({
        type: MediaActionTypes.MEDIA_SEEK_TO_LIVE_REQUEST,
      });
    },
    [dispatch, props.onClick],
  );

  if (!isLive) return null;

  return (
    <MediaPlayerTooltip tooltip="Go to live">
      <Button
        type="button"
        aria-label="Go to live"
        aria-controls={context.mediaId}
        data-disabled={isDisabled ? "" : undefined}
        data-state={isAtLiveEdge ? "live" : "behind"}
        data-slot="media-player-live"
        disabled={isDisabled}
        {...liveProps}
        variant="ghost"
        size="sm"
        className={cn(
          "h-6 gap-1.5 px-2 font-medium text-xs",
          !isAtLiveEdge && "bg-destructive text-destructive",
          className,
        )}
        onClick={onSeekToLive}
      >
        <div
          className={cn(
            "size-1.5 rounded-full",
            isAtLiveEdge ? "animate-pulse bg-red-500" : "bg-red-400",
          )}
        />
        {children ?? "LIVE"}
      </Button>
    </MediaPlayerTooltip>
  );
}

interface MediaPlayerCastProps extends React.ComponentProps<typeof Button> {
  onCastError?: (error: unknown, mode: "enter" | "exit") => void;
}

function MediaPlayerCast(props: MediaPlayerCastProps) {
  const { children, className, onCastError, disabled, ...castProps } = props;

  const context = useMediaPlayerContext(CAST_NAME);
  const dispatch = useMediaDispatch();
  const [isCasting, setIsCasting] = React.useState(false);

  const isDisabled = disabled || context.disabled;

  const onCast = React.useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      props.onClick?.(event);

      if (event.defaultPrevented) return;

      const newCastState = !isCasting;
      setIsCasting(newCastState);

      dispatch({
        type: newCastState
          ? MediaActionTypes.MEDIA_ENTER_CAST_REQUEST
          : MediaActionTypes.MEDIA_EXIT_CAST_REQUEST,
      });

      if (newCastState) {
        console.log("Initiating Cast connection...");
      } else {
        console.log("Disconnecting from Cast device...");
      }
    },
    [dispatch, props.onClick, isCasting],
  );

  return (
    <MediaPlayerTooltip tooltip={isCasting ? "Stop casting" : "Cast"}>
      <Button
        type="button"
        aria-label={isCasting ? "Stop casting" : "Cast"}
        data-disabled={isDisabled ? "" : undefined}
        data-state={isCasting ? "casting" : "disconnected"}
        data-slot="media-player-cast"
        disabled={isDisabled}
        {...castProps}
        variant="ghost"
        size="icon"
        className={cn("size-8", className)}
        onClick={onCast}
      >
        {children ?? <CastIcon className={cn(isCasting && "text-blue-500")} />}
      </Button>
    </MediaPlayerTooltip>
  );
}

interface MediaPlayerAirPlayProps extends React.ComponentProps<typeof Button> {
  onAirPlayError?: (error: unknown) => void;
}

function MediaPlayerAirPlay(props: MediaPlayerAirPlayProps) {
  const { children, className, onAirPlayError, disabled, ...airPlayProps } =
    props;

  const context = useMediaPlayerContext(AIRPLAY_NAME);
  const dispatch = useMediaDispatch();
  const [isAirPlayAvailable, setIsAirPlayAvailable] = React.useState(false);

  const isDisabled = disabled || context.disabled;

  React.useEffect(() => {
    const mediaElement = context.mediaRef.current;
    if (mediaElement instanceof HTMLVideoElement) {
      setIsAirPlayAvailable("webkitShowPlaybackTargetPicker" in mediaElement);
    }
  }, [context.mediaRef]);

  const onAirPlay = React.useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      props.onClick?.(event);

      if (event.defaultPrevented) return;

      dispatch({
        type: MediaActionTypes.MEDIA_AIRPLAY_REQUEST,
      });

      const mediaElement = context.mediaRef.current;
      if (
        mediaElement instanceof HTMLVideoElement &&
        "webkitShowPlaybackTargetPicker" in mediaElement
      ) {
        try {
          (
            mediaElement as HTMLVideoElement & {
              webkitShowPlaybackTargetPicker: () => void;
            }
          ).webkitShowPlaybackTargetPicker();
        } catch (error) {
          onAirPlayError?.(error);
        }
      }
    },
    [dispatch, props.onClick, onAirPlayError, context.mediaRef],
  );

  if (!isAirPlayAvailable) return null;

  return (
    <MediaPlayerTooltip tooltip="AirPlay">
      <Button
        type="button"
        aria-label="AirPlay"
        data-disabled={isDisabled ? "" : undefined}
        data-slot="media-player-airplay"
        disabled={isDisabled}
        {...airPlayProps}
        variant="ghost"
        size="icon"
        className={cn("size-8", className)}
        onClick={onAirPlay}
      >
        {children ?? <MonitorSpeakerIcon />}
      </Button>
    </MediaPlayerTooltip>
  );
}

interface MediaPlayerSettingsProps
  extends React.ComponentProps<typeof DropdownMenuTrigger> {
  speeds?: number[];
}

function MediaPlayerSettings(props: MediaPlayerSettingsProps) {
  const {
    asChild,
    speeds = SPEEDS,
    className,
    disabled,
    ...settingsProps
  } = props;

  const context = useMediaPlayerContext(SETTINGS_NAME);
  const dispatch = useMediaDispatch();

  const mediaPlaybackRate = useMediaSelector(
    (state) => state.mediaPlaybackRate ?? 1,
  );
  const mediaSubtitlesList = useMediaSelector(
    (state) => state.mediaSubtitlesList ?? [],
  );
  const mediaSubtitlesShowing = useMediaSelector(
    (state) => state.mediaSubtitlesShowing ?? [],
  );

  const isDisabled = disabled || context.disabled;
  const subtitlesOff = !mediaSubtitlesShowing?.length;

  const onPlaybackRateChange = React.useCallback(
    (rate: number) => {
      dispatch({
        type: MediaActionTypes.MEDIA_PLAYBACK_RATE_REQUEST,
        detail: rate,
      });
    },
    [dispatch],
  );

  const onToggleSubtitlesOff = React.useCallback(() => {
    dispatch({
      type: MediaActionTypes.MEDIA_TOGGLE_SUBTITLES_REQUEST,
      detail: false,
    });
  }, [dispatch]);

  const onShowSubtitleTrack = React.useCallback(
    (subtitleTrack: SubtitleTrack) => {
      dispatch({
        type: MediaActionTypes.MEDIA_TOGGLE_SUBTITLES_REQUEST,
        detail: false,
      });
      dispatch({
        type: MediaActionTypes.MEDIA_SHOW_SUBTITLES_REQUEST,
        detail: subtitleTrack,
      });
    },
    [dispatch],
  );

  const getCurrentSubtitleLabel = React.useCallback(() => {
    if (subtitlesOff) return "Off";
    if (mediaSubtitlesShowing.length > 0) {
      return mediaSubtitlesShowing[0]?.label || "On";
    }
    return "Off";
  }, [subtitlesOff, mediaSubtitlesShowing]);

  return (
    <DropdownMenu>
      <MediaPlayerTooltip tooltip="Settings">
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            aria-label="Settings"
            data-disabled={isDisabled ? "" : undefined}
            data-slot="media-player-settings"
            disabled={isDisabled}
            {...settingsProps}
            variant="ghost"
            size="icon"
            className={cn("size-8", className)}
          >
            <SettingsIcon />
          </Button>
        </DropdownMenuTrigger>
      </MediaPlayerTooltip>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="sr-only">Settings</DropdownMenuLabel>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <span className="flex-1">Speed</span>
            <Badge variant="outline" className="rounded-sm">
              {mediaPlaybackRate}x
            </Badge>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            {speeds.map((speed) => (
              <DropdownMenuItem
                key={speed}
                onClick={() => onPlaybackRateChange(speed)}
                className="justify-between"
              >
                <span>{speed}x</span>
                {mediaPlaybackRate === speed && (
                  <CircleIcon className="size-2 fill-current" />
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <span className="flex-1">Captions</span>
            <Badge variant="outline" className="rounded-sm">
              {getCurrentSubtitleLabel()}
            </Badge>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem
              onClick={onToggleSubtitlesOff}
              className="justify-between"
            >
              <span>Off</span>
              {subtitlesOff && <CircleIcon className="size-2 fill-current" />}
            </DropdownMenuItem>
            {mediaSubtitlesList.map((subtitleTrack: SubtitleTrack) => {
              const isSelected = mediaSubtitlesShowing.some(
                (showingSubtitle: SubtitleTrack) =>
                  showingSubtitle.label === subtitleTrack.label,
              );
              return (
                <DropdownMenuItem
                  key={`${subtitleTrack.kind}-${subtitleTrack.label}-${subtitleTrack.language}`}
                  onClick={() => onShowSubtitleTrack(subtitleTrack)}
                  className="justify-between"
                >
                  <span>{subtitleTrack.label}</span>
                  {isSelected && <CircleIcon className="size-2 fill-current" />}
                </DropdownMenuItem>
              );
            })}
            {!mediaSubtitlesList.length && (
              <DropdownMenuItem disabled>
                No captions available
              </DropdownMenuItem>
            )}
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

interface MediaPlayerResolutionProps
  extends React.ComponentProps<typeof DropdownMenuTrigger> {}

function MediaPlayerResolution(props: MediaPlayerResolutionProps) {
  const { asChild, className, disabled, ...resolutionProps } = props;

  const context = useMediaPlayerContext("MediaPlayerResolution");
  const dispatch = useMediaDispatch();

  const mediaRenditionList = useMediaSelector(
    (state) => state.mediaRenditionList,
  );
  const currentRendition = React.useMemo(() => {
    return mediaRenditionList?.find((rendition: unknown) => {
      const r = rendition as { selected?: boolean };
      return r.selected;
    });
  }, [mediaRenditionList]);

  const isDisabled =
    disabled || context.disabled || !mediaRenditionList?.length;

  const onRenditionChange = React.useCallback(
    (renditionId: string) => {
      dispatch({
        type: MediaActionTypes.MEDIA_RENDITION_REQUEST,
        detail: renditionId === "auto" ? undefined : renditionId,
      });
    },
    [dispatch],
  );

  const getCurrentQualityLabel = React.useCallback(() => {
    if (!currentRendition) return "Auto";
    const r = currentRendition as {
      height?: number;
      width?: number;
      id?: string;
    };
    if (r.height) return `${r.height}p`;
    if (r.width) return `${r.width}p`;
    return r.id || "Auto";
  }, [currentRendition]);

  return (
    <DropdownMenu>
      <MediaPlayerTooltip tooltip="Video quality">
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            aria-label="Video quality"
            aria-controls={context.mediaId}
            data-disabled={isDisabled ? "" : undefined}
            data-slot="media-player-resolution"
            disabled={isDisabled}
            {...resolutionProps}
            variant="ghost"
            size="icon"
            className={cn("size-8", className)}
          >
            <VideoIcon />
          </Button>
        </DropdownMenuTrigger>
      </MediaPlayerTooltip>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel className="flex items-center gap-2">
          <VideoIcon className="size-4" />
          Quality
          <Badge variant="secondary" className="ml-auto text-xs">
            {getCurrentQualityLabel()}
          </Badge>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {!mediaRenditionList?.length ? (
          <DropdownMenuItem disabled>
            No quality options available
          </DropdownMenuItem>
        ) : (
          <>
            <DropdownMenuItem
              onClick={() => onRenditionChange("auto")}
              className="justify-between"
            >
              <span>Auto</span>
              {!currentRendition && (
                <CircleIcon className="size-2 fill-current" />
              )}
            </DropdownMenuItem>
            {mediaRenditionList
              .slice()
              .sort((a: unknown, b: unknown) => {
                const aHeight = (a as { height?: number }).height || 0;
                const bHeight = (b as { height?: number }).height || 0;
                return bHeight - aHeight;
              })
              .map((rendition: unknown) => {
                const r = rendition as {
                  height?: number;
                  width?: number;
                  id?: string;
                  selected?: boolean;
                };
                const label = r.height
                  ? `${r.height}p`
                  : r.width
                    ? `${r.width}p`
                    : r.id || "Unknown";

                return (
                  <DropdownMenuItem
                    key={r.id}
                    onClick={() => onRenditionChange(r.id || "")}
                    className="justify-between"
                  >
                    <span>{label}</span>
                    {r.selected && (
                      <CircleIcon className="size-2 fill-current" />
                    )}
                  </DropdownMenuItem>
                );
              })}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

interface MediaPlayerPreviewProps extends React.ComponentProps<"div"> {
  thumbnailSrc?: string | ((time: number) => string);
}

function MediaPlayerPreview(props: MediaPlayerPreviewProps) {
  const { thumbnailSrc, className, ...previewProps } = props;

  const [previewTime, setPreviewTime] = React.useState(0);
  const [isVisible, setIsVisible] = React.useState(false);

  const previewRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const onPreviewRequest = (event: CustomEvent) => {
      if (event.detail && typeof event.detail === "number") {
        setPreviewTime(event.detail);
        setIsVisible(true);
      }
    };

    const onHidePreview = () => {
      setIsVisible(false);
    };

    document.addEventListener(
      "mediapreviewrequest",
      onPreviewRequest as EventListener,
    );
    document.addEventListener("mediahidepreview", onHidePreview);

    return () => {
      document.removeEventListener(
        "mediapreviewrequest",
        onPreviewRequest as EventListener,
      );
      document.removeEventListener("mediahidepreview", onHidePreview);
    };
  }, []);

  const thumbnailUrl = React.useMemo(() => {
    if (!thumbnailSrc) return null;
    return typeof thumbnailSrc === "function"
      ? thumbnailSrc(previewTime)
      : thumbnailSrc;
  }, [thumbnailSrc, previewTime]);

  if (!isVisible || !thumbnailUrl) return null;

  return (
    <div
      ref={previewRef}
      data-slot="media-player-preview"
      className={cn(
        "pointer-events-none absolute z-50 rounded border bg-background p-1 shadow-lg",
        className,
      )}
      style={{
        transform: "translate(-50%, -100%)",
      }}
      {...previewProps}
    >
      <img
        src={thumbnailUrl}
        alt={`Preview at ${timeUtils.formatTime(previewTime, previewTime)}`}
        className="h-20 w-32 rounded object-cover"
      />
      <div className="mt-1 text-center text-xs">
        {timeUtils.formatTime(previewTime, previewTime)}
      </div>
    </div>
  );
}

interface MediaPlayerTooltipProps extends React.ComponentProps<typeof Tooltip> {
  tooltip?: string;
  shortcut?: string | string[];
}

function MediaPlayerTooltip({
  tooltip,
  shortcut,
  children,
  ...props
}: MediaPlayerTooltipProps) {
  if (!tooltip && !shortcut) return <>{children}</>;

  return (
    <Tooltip {...props} delayDuration={600}>
      <TooltipTrigger
        className="text-foreground focus-visible:ring-ring/80"
        asChild
      >
        {children}
      </TooltipTrigger>
      <TooltipContent
        sideOffset={6}
        className="flex items-center gap-2 border bg-accent px-2 py-1 font-medium text-foreground dark:bg-zinc-900 [&>span]:hidden"
      >
        <p>{tooltip}</p>
        {Array.isArray(shortcut) ? (
          <div className="flex items-center gap-1">
            {shortcut.map((shortcutKey) => (
              <kbd
                key={shortcutKey}
                className="select-none rounded border bg-secondary px-1.5 py-0.5 font-mono text-[0.7rem] text-foreground shadow-xs"
              >
                <abbr title={shortcutKey} className="no-underline">
                  {shortcutKey}
                </abbr>
              </kbd>
            ))}
          </div>
        ) : (
          shortcut && (
            <kbd
              key={shortcut}
              className="select-none rounded border bg-secondary px-1.5 py-px font-mono text-[0.7rem] text-foreground shadow-xs"
            >
              <abbr title={shortcut} className="no-underline">
                {shortcut}
              </abbr>
            </kbd>
          )
        )}
      </TooltipContent>
    </Tooltip>
  );
}

export {
  MediaPlayerRoot as MediaPlayer,
  MediaPlayerVideo,
  MediaPlayerAudio,
  MediaPlayerControls,
  MediaPlayerOverlay,
  MediaPlayerLoading,
  MediaPlayerPlay,
  MediaPlayerSeekBackward,
  MediaPlayerSeekForward,
  MediaPlayerSeek,
  MediaPlayerVolume,
  MediaPlayerTime,
  MediaPlayerPlaybackSpeed,
  MediaPlayerLoop,
  MediaPlayerFullscreen,
  MediaPlayerPiP,
  MediaPlayerCaptions,
  MediaPlayerDownload,
  MediaPlayerLive,
  MediaPlayerCast,
  MediaPlayerAirPlay,
  MediaPlayerSettings,
  MediaPlayerResolution,
  MediaPlayerPreview,
  //
  MediaPlayerRoot as Root,
  MediaPlayerVideo as Video,
  MediaPlayerAudio as Audio,
  MediaPlayerControls as Controls,
  MediaPlayerOverlay as Overlay,
  MediaPlayerLoading as Loading,
  MediaPlayerPlay as Play,
  MediaPlayerSeekBackward as SeekBackward,
  MediaPlayerSeekForward as SeekForward,
  MediaPlayerSeek as Seek,
  MediaPlayerVolume as Volume,
  MediaPlayerTime as Time,
  MediaPlayerPlaybackSpeed as PlaybackSpeed,
  MediaPlayerLoop as Loop,
  MediaPlayerFullscreen as Fullscreen,
  MediaPlayerPiP as PiP,
  MediaPlayerCaptions as Captions,
  MediaPlayerDownload as Download,
  MediaPlayerLive as Live,
  MediaPlayerCast as Cast,
  MediaPlayerAirPlay as AirPlay,
  MediaPlayerSettings as Settings,
  MediaPlayerResolution as Resolution,
  MediaPlayerPreview as Preview,
  //
  useMediaSelector as useMediaPlayer,
};
