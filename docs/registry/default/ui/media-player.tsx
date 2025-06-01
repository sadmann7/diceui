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
  CheckIcon,
  DownloadIcon,
  FastForwardIcon,
  Loader2Icon,
  Maximize2Icon,
  Minimize2Icon,
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
import * as ReactDOM from "react-dom";

const SEEK_AMOUNT_SHORT = 5;
const SEEK_AMOUNT_LONG = 10;
const LOADING_DELAY_MS = 500;
const ESTIMATED_SEEK_TOOLTIP_WIDTH = 240;
const ESTIMATED_SEEK_TOOLTIP_HEIGHT = 200;
const POPOVER_SIDE_OFFSET = 26;
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

type Direction = "ltr" | "rtl";

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
  rootRef: React.RefObject<HTMLDivElement | null>;
  mediaRef: React.RefObject<HTMLVideoElement | HTMLAudioElement | null>;
  portalContainer: Element | DocumentFragment | null;
  isVideo: boolean;
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
  dir?: Direction;
  label?: string;
  asChild?: boolean;
  disabled?: boolean;
}

function MediaPlayerRoot(props: MediaPlayerRootProps) {
  return (
    <MediaProvider>
      <MediaPlayerRootImpl {...props} />
    </MediaProvider>
  );
}

function MediaPlayerRootImpl(props: MediaPlayerRootProps) {
  const {
    onPlay: onPlayProp,
    onPause: onPauseProp,
    onEnded: onEndedProp,
    onTimeUpdate: onTimeUpdateProp,
    onFullscreenChange: onFullscreenChangeProp,
    onVolumeChange: onVolumeChangeProp,
    onMuted,
    onPipError,
    dir: dirProp,
    label,
    asChild,
    disabled = false,
    children,
    className,
    ref,
    ...rootImplProps
  } = props;

  const mediaId = React.useId();
  const labelId = React.useId();
  const descriptionId = React.useId();

  const dispatch = useMediaDispatch();

  const rootRef = React.useRef<HTMLDivElement | null>(null);
  const fullscreenRef = useMediaFullscreenRef();
  const composedRef = useComposedRefs(ref, rootRef, fullscreenRef);

  const mediaRef = React.useRef<HTMLVideoElement | HTMLAudioElement | null>(
    null,
  );

  const [mounted, setMounted] = React.useState(false);
  React.useLayoutEffect(() => setMounted(true), []);

  const isFullscreen = useMediaSelector((state) => state.mediaIsFullscreen);

  const portalContainer = mounted
    ? isFullscreen
      ? rootRef.current
      : globalThis.document.body
    : null;

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
      rootRef,
      mediaRef,
      portalContainer,
      disabled,
      isVideo,
    }),
    [mediaId, labelId, descriptionId, dir, portalContainer, disabled, isVideo],
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
          dispatch({
            type: MediaActionTypes.MEDIA_SEEK_REQUEST,
            detail: 0,
          });
          break;
        }

        case "end": {
          event.preventDefault();
          dispatch({
            type: MediaActionTypes.MEDIA_SEEK_REQUEST,
            detail: media.duration,
          });
          break;
        }
      }
    },
    [dispatch, disabled, rootImplProps.onKeyDown, onPipError],
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
        dir={dir}
        tabIndex={disabled ? undefined : 0}
        onKeyDown={onKeyDown}
        {...rootImplProps}
        ref={composedRef}
        className={cn(
          "relative isolate flex flex-col overflow-hidden rounded-lg bg-background outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
          "[:fullscreen_&]:flex [:fullscreen_&]:h-full [:fullscreen_&]:max-h-screen [:fullscreen_&]:flex-col [:fullscreen_&]:justify-between",
          "[&_[data-slider]::before]:-top-4 [&_[data-slider]::before]:-bottom-2 [&_[data-slider]::before]:absolute [&_[data-slider]::before]:inset-x-0 [&_[data-slider]::before]:z-10 [&_[data-slider]::before]:h-8 [&_[data-slider]::before]:cursor-pointer [&_[data-slider]::before]:content-[''] [&_[data-slider]]:relative",
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
  const { asChild, children, className, ref, ...videoProps } = props;

  const context = useMediaPlayerContext(VIDEO_NAME);
  const dispatch = useMediaDispatch();
  const mediaRefCallback = useMediaRef();
  const composedRef = useComposedRefs(ref, context.mediaRef, mediaRefCallback);

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
      aria-describedby={context.descriptionId}
      aria-labelledby={context.labelId}
      data-slot="media-player-video"
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
  const { asChild, children, className, ref, ...audioProps } = props;

  const context = useMediaPlayerContext(AUDIO_NAME);
  const mediaRefCallback = useMediaRef();
  const composedRef = useComposedRefs(ref, context.mediaRef, mediaRefCallback);

  const AudioPrimitive = asChild ? Slot : "audio";

  return (
    <AudioPrimitive
      aria-describedby={context.descriptionId}
      aria-labelledby={context.labelId}
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
      data-slot="media-player-overlay"
      data-state={isFullscreen ? "fullscreen" : "windowed"}
      {...overlayProps}
      className={cn(
        "-z-10 absolute inset-0 bg-gradient-to-t from-black/80 to-transparent",
        className,
      )}
    />
  );
}

interface MediaPlayerLoadingProps extends React.ComponentProps<"div"> {
  delay?: number;
  variant?: "default" | "dots" | "spinner";
  asChild?: boolean;
}

function MediaPlayerLoading(props: MediaPlayerLoadingProps) {
  const {
    variant = "default",
    delay = LOADING_DELAY_MS,
    asChild,
    className,
    children,
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
    <MediaPlayerPortal>
      <LoadingPrimitive
        role="status"
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
    </MediaPlayerPortal>
  );
}

interface MediaPlayerPlayProps extends React.ComponentProps<typeof Button> {}

function MediaPlayerPlay(props: MediaPlayerPlayProps) {
  const { asChild, children, className, disabled, ...playButtonProps } = props;

  const context = useMediaPlayerContext(PLAY_NAME);
  const dispatch = useMediaDispatch();
  const mediaPaused = useMediaSelector((state) => state.mediaPaused);

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
        aria-controls={context.mediaId}
        aria-label={mediaPaused ? "Play" : "Pause"}
        aria-pressed={!mediaPaused}
        data-disabled={isDisabled ? "" : undefined}
        data-slot="media-player-play-button"
        data-state={mediaPaused ? "off" : "on"}
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
        aria-controls={context.mediaId}
        aria-label={`Back ${seconds} seconds`}
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
        aria-controls={context.mediaId}
        aria-label={`Forward ${seconds} seconds`}
        data-disabled={isDisabled ? "" : undefined}
        data-slot="media-player-seek-forward"
        disabled={isDisabled}
        {...seekForwardProps}
        variant="ghost"
        size="icon"
        onClick={onSeekForward}
      >
        {children ?? <FastForwardIcon />}
      </Button>
    </MediaPlayerTooltip>
  );
}

interface SeekState {
  isHovering: boolean;
  hoverTime: number;
  pendingSeekTime: number | null;
  tooltipPosition: { x: number; y: number } | null;
  hasInitialPosition: boolean;
}

interface MediaPlayerSeekProps
  extends React.ComponentProps<typeof SliderPrimitive.Root> {
  previewThumbnailSrc?: string | ((time: number) => string);
  sideOffset?: number;
  collisionBoundary?: Element | Element[];
  collisionPadding?:
    | number
    | Partial<Record<"top" | "right" | "bottom" | "left", number>>;
  withTime?: boolean;
  withDurationPreview?: boolean;
  withoutPreviewThumbnail?: boolean;
  withoutChapter?: boolean;
}

function MediaPlayerSeek(props: MediaPlayerSeekProps) {
  const {
    previewThumbnailSrc,
    sideOffset = 10,
    collisionPadding = 10,
    collisionBoundary,
    withTime = false,
    withDurationPreview = false,
    withoutPreviewThumbnail = false,
    withoutChapter = false,
    className,
    disabled,
    ...seekProps
  } = props;

  const context = useMediaPlayerContext(SEEK_NAME);
  const dispatch = useMediaDispatch();
  const mediaCurrentTime = useMediaSelector(
    (state) => state.mediaCurrentTime ?? 0,
  );
  const [seekableStart = 0, seekableEnd = 0] =
    useMediaSelector((state) => state.mediaSeekable) ?? [];
  const mediaBuffered = useMediaSelector((state) => state.mediaBuffered);
  const mediaEnded = useMediaSelector((state) => state.mediaEnded);

  const chapterCues = useMediaSelector(
    (state) => state.mediaChaptersCues ?? [],
  );
  const mediaPreviewTime = useMediaSelector((state) => state.mediaPreviewTime);
  const mediaPreviewImage = useMediaSelector(
    (state) => state.mediaPreviewImage,
  );
  const mediaPreviewCoords = useMediaSelector(
    (state) => state.mediaPreviewCoords,
  );

  const seekRef = React.useRef<HTMLDivElement>(null);
  const tooltipRef = React.useRef<HTMLDivElement>(null);

  const [seekState, setSeekState] = React.useState<SeekState>({
    isHovering: false,
    hoverTime: 0,
    pendingSeekTime: null,
    tooltipPosition: null,
    hasInitialPosition: false,
  });

  const rafIdRef = React.useRef<number | null>(null);
  const seekThrottleTimeoutRef = React.useRef<number | null>(null);
  const hoverTimeoutRef = React.useRef<number | null>(null);
  const lastPointerXRef = React.useRef<number>(0);
  const previewDebounceRef = React.useRef<number | null>(null);

  const displayValue = seekState.pendingSeekTime ?? mediaCurrentTime;

  const formattedCurrentTime = timeUtils.formatTime(displayValue, seekableEnd);
  const formattedDuration = timeUtils.formatTime(seekableEnd, seekableEnd);
  const formattedHoverTime = timeUtils.formatTime(
    seekState.hoverTime,
    seekableEnd,
  );
  const formattedRemainingTime = timeUtils.formatTime(
    seekableEnd - displayValue,
    seekableEnd,
  );

  const isDisabled = disabled || context.disabled;

  const getCurrentChapterCue = React.useCallback(
    (time: number) => {
      if (withoutChapter || !chapterCues.length) return null;
      return chapterCues.find((c) => time >= c.startTime && time < c.endTime);
    },
    [chapterCues, withoutChapter],
  );

  const getPreviewThumbnail = React.useCallback(
    (time: number) => {
      if (withoutPreviewThumbnail) return null;

      if (previewThumbnailSrc) {
        const src =
          typeof previewThumbnailSrc === "function"
            ? previewThumbnailSrc(time)
            : previewThumbnailSrc;
        return { src, coords: null };
      }

      if (
        mediaPreviewTime !== undefined &&
        Math.abs(time - mediaPreviewTime) < 0.1 &&
        mediaPreviewImage
      ) {
        return {
          src: mediaPreviewImage,
          coords: mediaPreviewCoords ?? null,
        };
      }

      return null;
    },
    [
      previewThumbnailSrc,
      mediaPreviewTime,
      mediaPreviewImage,
      mediaPreviewCoords,
      withoutPreviewThumbnail,
    ],
  );

  const onPreviewUpdate = React.useCallback(
    (time: number) => {
      if (previewDebounceRef.current) {
        cancelAnimationFrame(previewDebounceRef.current);
      }

      previewDebounceRef.current = requestAnimationFrame(() => {
        dispatch({
          type: MediaActionTypes.MEDIA_PREVIEW_REQUEST,
          detail: time,
        });
        previewDebounceRef.current = null;
      });
    },
    [dispatch],
  );

  React.useEffect(() => {
    if (seekState.pendingSeekTime !== null) {
      const diff = Math.abs(mediaCurrentTime - seekState.pendingSeekTime);
      if (diff < 0.5) {
        setSeekState((prev) => ({ ...prev, pendingSeekTime: null }));
      }
    }
  }, [mediaCurrentTime, seekState.pendingSeekTime]);

  React.useEffect(() => {
    if (!seekState.isHovering) return;

    function onScroll() {
      setSeekState((prev) => ({
        ...prev,
        isHovering: false,
        tooltipPosition: null,
      }));
      dispatch({
        type: MediaActionTypes.MEDIA_PREVIEW_REQUEST,
        detail: undefined,
      });
    }

    document.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      document.removeEventListener("scroll", onScroll);
    };
  }, [seekState.isHovering, dispatch]);

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

  const getCollisionPadding = React.useCallback(() => {
    if (typeof collisionPadding === "number") {
      return {
        top: collisionPadding,
        right: collisionPadding,
        bottom: collisionPadding,
        left: collisionPadding,
      };
    }
    return {
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      ...collisionPadding,
    };
  }, [collisionPadding]);

  const getCollisionBoundaries = React.useCallback(() => {
    if (collisionBoundary) {
      return Array.isArray(collisionBoundary)
        ? collisionBoundary
        : [collisionBoundary];
    }
    return [context.rootRef.current].filter(Boolean) as Element[];
  }, [collisionBoundary, context.rootRef]);

  const onTooltipPositionUpdate = React.useCallback(
    (clientX: number) => {
      if (!seekRef.current || !tooltipRef.current) return;

      const tooltipWidth =
        tooltipRef.current.offsetWidth || ESTIMATED_SEEK_TOOLTIP_WIDTH;
      const tooltipHeight =
        tooltipRef.current.offsetHeight || ESTIMATED_SEEK_TOOLTIP_HEIGHT;
      const seekRect = seekRef.current.getBoundingClientRect();

      let x = clientX;
      let y = seekRect.top - tooltipHeight - sideOffset;

      const padding = getCollisionPadding();
      const boundaries = getCollisionBoundaries();

      let minTop = 0;
      let maxBottom = window.innerHeight;

      for (const boundary of boundaries) {
        const boundaryRect = boundary.getBoundingClientRect();
        minTop = Math.max(minTop, boundaryRect.top + padding.top);
        maxBottom = Math.min(maxBottom, boundaryRect.bottom - padding.bottom);
      }

      if (y < minTop) {
        y = seekRect.bottom + sideOffset;
        if (y + tooltipHeight > maxBottom) {
          y = maxBottom - tooltipHeight - padding.bottom;
        }
      }

      const viewportPadding = 10;
      if (y < viewportPadding) {
        y = viewportPadding;
      } else if (y + tooltipHeight > window.innerHeight - viewportPadding) {
        y = window.innerHeight - viewportPadding - tooltipHeight;
      }

      const halfTooltipWidth = tooltipWidth / 2;

      let minLeft = 0;
      let maxRight = window.innerWidth;

      for (const boundary of boundaries) {
        const boundaryRect = boundary.getBoundingClientRect();
        minLeft = Math.max(minLeft, boundaryRect.left + padding.left);
        maxRight = Math.min(maxRight, boundaryRect.right - padding.right);
      }

      if (x - halfTooltipWidth < minLeft) {
        x = minLeft + halfTooltipWidth;
      } else if (x + halfTooltipWidth > maxRight) {
        x = maxRight - halfTooltipWidth;
      }

      if (x - halfTooltipWidth < viewportPadding) {
        x = viewportPadding + halfTooltipWidth;
      } else if (x + halfTooltipWidth > window.innerWidth - viewportPadding) {
        x = window.innerWidth - viewportPadding - halfTooltipWidth;
      }

      setSeekState((prev) => ({
        ...prev,
        tooltipPosition: { x, y },
        hasInitialPosition: true,
      }));
    },
    [getCollisionPadding, getCollisionBoundaries, sideOffset],
  );

  const onPointerEnter = React.useCallback(() => {
    if (seekableEnd > 0) {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }

      if (lastPointerXRef.current && seekRef.current) {
        const seekRect = seekRef.current.getBoundingClientRect();
        const clientX = Math.max(
          seekRect.left,
          Math.min(lastPointerXRef.current, seekRect.right),
        );

        onTooltipPositionUpdate(clientX);

        requestAnimationFrame(() => {
          hoverTimeoutRef.current = window.setTimeout(() => {
            setSeekState((prev) => ({ ...prev, isHovering: true }));
          }, 16);
        });
      } else {
        hoverTimeoutRef.current = window.setTimeout(() => {
          setSeekState((prev) => ({ ...prev, isHovering: true }));
        }, 50);
      }
    }
  }, [seekableEnd, onTooltipPositionUpdate]);

  const onPointerLeave = React.useCallback(() => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
    if (previewDebounceRef.current) {
      cancelAnimationFrame(previewDebounceRef.current);
      previewDebounceRef.current = null;
    }

    setSeekState((prev) => ({
      ...prev,
      isHovering: false,
      tooltipPosition: null,
      hasInitialPosition: false,
    }));

    dispatch({
      type: MediaActionTypes.MEDIA_PREVIEW_REQUEST,
      detail: undefined,
    });
  }, [dispatch]);

  const onPointerMove = React.useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (!seekRef.current || seekableEnd <= 0) return;

      lastPointerXRef.current = event.clientX;

      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }

      rafIdRef.current = requestAnimationFrame(() => {
        const seekRect = seekRef.current?.getBoundingClientRect();
        if (!seekRect) return;

        const clientX = lastPointerXRef.current;
        const offsetXOnSeekBar = Math.max(
          0,
          Math.min(clientX - seekRect.left, seekRect.width),
        );
        const relativeX = offsetXOnSeekBar / seekRect.width;
        const calculatedHoverTime = relativeX * seekableEnd;

        setSeekState((prev) => ({
          ...prev,
          hoverTime: calculatedHoverTime,
          isHovering:
            prev.isHovering ||
            (clientX >= seekRect.left && clientX <= seekRect.right),
        }));

        onPreviewUpdate(calculatedHoverTime);

        if (
          seekState.isHovering ||
          seekState.tooltipPosition ||
          (clientX >= seekRect.left && clientX <= seekRect.right)
        ) {
          if (clientX < seekRect.left || clientX > seekRect.right) {
            setSeekState((prev) => ({ ...prev, tooltipPosition: null }));
            return;
          }

          onTooltipPositionUpdate(clientX);
        }

        rafIdRef.current = null;
      });
    },
    [
      seekableEnd,
      seekState.isHovering,
      seekState.tooltipPosition,
      onPreviewUpdate,
      onTooltipPositionUpdate,
    ],
  );

  const onSeek = React.useCallback(
    (value: number[]) => {
      const time = value[0] ?? 0;

      setSeekState((prev) => ({ ...prev, pendingSeekTime: time }));

      if (seekThrottleTimeoutRef.current) {
        cancelAnimationFrame(seekThrottleTimeoutRef.current);
      }

      seekThrottleTimeoutRef.current = requestAnimationFrame(() => {
        dispatch({
          type: MediaActionTypes.MEDIA_SEEK_REQUEST,
          detail: time,
        });
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

      setSeekState((prev) => ({
        ...prev,
        pendingSeekTime: time,
        isHovering: false,
        tooltipPosition: null,
        hasInitialPosition: false,
      }));

      dispatch({
        type: MediaActionTypes.MEDIA_SEEK_REQUEST,
        detail: time,
      });

      dispatch({
        type: MediaActionTypes.MEDIA_PREVIEW_REQUEST,
        detail: undefined,
      });
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
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
      if (previewDebounceRef.current) {
        cancelAnimationFrame(previewDebounceRef.current);
      }
    };
  }, []);

  const currentChapterCue = getCurrentChapterCue(seekState.hoverTime);
  const previewThumbnail = getPreviewThumbnail(seekState.hoverTime);

  const tooltipStyle = React.useMemo<React.CSSProperties>(() => {
    if (!seekState.tooltipPosition || !seekState.isHovering) {
      return {
        visibility: "hidden",
        opacity: 0,
        pointerEvents: "none",
        position: "fixed" as const,
        left: seekState.tooltipPosition?.x ?? 0,
        top: seekState.tooltipPosition?.y ?? 0,
        transform: "translateX(-50%)",
        transition: "none",
        willChange: "opacity",
      };
    }

    return {
      left: `${seekState.tooltipPosition.x}px`,
      top: `${seekState.tooltipPosition.y}px`,
      position: "fixed" as const,
      transform: "translateX(-50%)",
      visibility: "visible" as const,
      opacity: 1,
      zIndex: 50,
      pointerEvents: "none",
      transition: seekState.hasInitialPosition
        ? "opacity 150ms ease-in-out"
        : "none",
      willChange: "opacity",
    };
  }, [
    seekState.tooltipPosition,
    seekState.isHovering,
    seekState.hasInitialPosition,
  ]);

  const SeekSlider = (
    <div className="relative w-full">
      <SliderPrimitive.Root
        aria-controls={context.mediaId}
        aria-valuetext={`${formattedCurrentTime} of ${formattedDuration}`}
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
        value={[displayValue]}
        onValueChange={onSeek}
        onValueCommit={onSeekCommit}
        onPointerEnter={onPointerEnter}
        onPointerLeave={onPointerLeave}
        onPointerMove={onPointerMove}
      >
        <SliderPrimitive.Track className="relative h-1 w-full grow overflow-hidden rounded-full bg-primary/40">
          <div
            data-slot="media-player-seek-buffered"
            className="absolute h-full bg-primary/70 will-change-[width]"
            style={{
              width: `${bufferedProgress * 100}%`,
            }}
          />
          <SliderPrimitive.Range className="absolute h-full bg-primary will-change-[width]" />
          {seekState.isHovering && seekableEnd > 0 && (
            <div
              data-slot="media-player-seek-hover-range"
              className="absolute h-full bg-primary/70 will-change-[width,opacity]"
              style={{
                width: `${Math.min(100, (seekState.hoverTime / seekableEnd) * 100)}%`,
                transition: "opacity 150ms ease-out",
              }}
            />
          )}
          {!withoutChapter &&
            chapterCues.length > 1 &&
            seekableEnd > 0 &&
            chapterCues.slice(1).map((chapterCue, index) => {
              const position = (chapterCue.startTime / seekableEnd) * 100;

              return (
                <div
                  key={`chapter-${index}-${chapterCue.startTime}`}
                  role="presentation"
                  aria-hidden="true"
                  data-slot="media-player-seek-chapter-separator"
                  className="absolute top-0 h-full w-[2.5px] bg-zinc-50 dark:bg-zinc-950"
                  style={{
                    left: `${position}%`,
                    transform: "translateX(-50%)",
                  }}
                />
              );
            })}
        </SliderPrimitive.Track>
        <SliderPrimitive.Thumb className="relative z-10 block size-2.5 shrink-0 rounded-full bg-primary shadow-sm ring-ring/50 transition-[color,box-shadow] will-change-transform hover:ring-4 focus-visible:outline-hidden focus-visible:ring-4 disabled:pointer-events-none disabled:opacity-50" />
      </SliderPrimitive.Root>
      {(seekState.isHovering || seekState.tooltipPosition) &&
        seekableEnd > 0 && (
          <MediaPlayerPortal>
            <div
              ref={tooltipRef}
              style={tooltipStyle}
              className="pointer-events-none z-50 [backface-visibility:hidden] [contain:layout_style] [transition:none]"
            >
              <div
                className={cn(
                  "flex flex-col items-center gap-1.5 rounded-md border bg-background text-foreground shadow-sm dark:bg-zinc-900",
                  !previewThumbnail && currentChapterCue && "px-3 py-1.5",
                )}
              >
                {previewThumbnail && (
                  <div
                    data-slot="media-player-seek-thumbnail"
                    className="overflow-hidden rounded-md rounded-b-none"
                  >
                    {previewThumbnail.coords ? (
                      <div
                        className="h-32 w-56"
                        style={{
                          backgroundImage: `url(${previewThumbnail.src})`,
                          backgroundPosition: `-${previewThumbnail.coords[0]}px -${previewThumbnail.coords[1]}px`,
                          backgroundSize: "auto",
                          backgroundRepeat: "no-repeat",
                        }}
                      />
                    ) : (
                      <img
                        src={previewThumbnail.src}
                        alt={`Preview at ${formattedHoverTime}`}
                        className="h-32 w-56 object-cover"
                      />
                    )}
                  </div>
                )}
                {currentChapterCue && (
                  <div
                    data-slot="media-player-seek-chapter-title"
                    className="line-clamp-2 max-w-48 text-balance text-center text-xs"
                  >
                    {currentChapterCue.text}
                  </div>
                )}
                <div
                  data-slot="media-player-seek-time"
                  className={cn(
                    "whitespace-nowrap text-xs tabular-nums",
                    previewThumbnail && "pb-1.5",
                    !(previewThumbnail || currentChapterCue) && "px-3 py-1.5",
                  )}
                >
                  {withDurationPreview
                    ? `${formattedHoverTime} / ${formattedDuration}`
                    : formattedHoverTime}
                </div>
              </div>
            </div>
          </MediaPlayerPortal>
        )}
    </div>
  );

  if (withTime) {
    return (
      <div className="flex w-full items-center gap-2">
        <span className="text-sm tabular-nums">{formattedCurrentTime}</span>
        {SeekSlider}
        <span className="text-sm tabular-nums">{formattedRemainingTime}</span>
      </div>
    );
  }

  return SeekSlider;
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
  const volumeRafRef = React.useRef<number | null>(null);

  const isDisabled = disabled || context.disabled;

  const onVolumeChange = React.useCallback(
    (value: number[]) => {
      const volume = value[0] ?? 0;

      if (volumeRafRef.current) {
        cancelAnimationFrame(volumeRafRef.current);
      }

      volumeRafRef.current = requestAnimationFrame(() => {
        dispatch({
          type: MediaActionTypes.MEDIA_VOLUME_REQUEST,
          detail: volume,
        });
        volumeRafRef.current = null;
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

  React.useEffect(() => {
    return () => {
      if (volumeRafRef.current) {
        cancelAnimationFrame(volumeRafRef.current);
      }
    };
  }, []);

  const effectiveVolume = mediaMuted ? 0 : mediaVolume;

  return (
    <div
      role="group"
      data-disabled={isDisabled ? "" : undefined}
      className={cn(
        "group flex items-center",
        expandable
          ? "gap-0 group-focus-within:gap-2 group-hover:gap-2"
          : "gap-2",
        className,
      )}
    >
      <MediaPlayerTooltip tooltip="Volume" shortcut="M">
        <Button
          id={volumeTriggerId}
          type="button"
          aria-controls={`${context.mediaId} ${sliderId}`}
          aria-label={mediaMuted ? "Unmute" : "Mute"}
          aria-pressed={mediaMuted}
          data-slot="media-player-mute"
          data-state={mediaMuted ? "on" : "off"}
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
            ? "w-0 opacity-0 transition-[width,opacity] duration-200 ease-in-out group-focus-within:w-16 group-focus-within:opacity-100 group-hover:w-16 group-hover:opacity-100"
            : "w-16",
          className,
        )}
        disabled={isDisabled}
        value={[effectiveVolume]}
        onValueChange={onVolumeChange}
      >
        <SliderPrimitive.Track className="relative h-1 w-full grow overflow-hidden rounded-full bg-zinc-500">
          <SliderPrimitive.Range className="absolute h-full bg-primary will-change-[width]" />
        </SliderPrimitive.Track>
        <SliderPrimitive.Thumb className="block size-2.5 shrink-0 rounded-full bg-primary shadow-sm ring-ring/50 transition-[color,box-shadow] will-change-transform hover:ring-4 focus-visible:outline-hidden focus-visible:ring-4 disabled:pointer-events-none disabled:opacity-50" />
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
      data-slot="media-player-time"
      dir={context.dir}
      {...timeProps}
      className={cn(
        "flex items-center gap-1 text-foreground/80 text-sm",
        className,
      )}
    >
      <span className="tabular-nums">{formattedCurrentTime}</span>
      <span role="presentation" aria-hidden="true">
        /
      </span>
      <span className="tabular-nums">{formattedDuration}</span>
    </TimePrimitive>
  );
}

interface MediaPlayerPlaybackSpeedProps
  extends React.ComponentProps<typeof DropdownMenuTrigger>,
    React.ComponentProps<typeof Button>,
    Omit<React.ComponentProps<typeof DropdownMenu>, "dir">,
    Pick<React.ComponentProps<typeof DropdownMenuContent>, "sideOffset"> {
  speeds?: number[];
}

function MediaPlayerPlaybackSpeed(props: MediaPlayerPlaybackSpeedProps) {
  const {
    open,
    defaultOpen,
    onOpenChange,
    sideOffset = POPOVER_SIDE_OFFSET,
    speeds = SPEEDS,
    asChild,
    modal = false,
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
    (rate: number) => {
      dispatch({
        type: MediaActionTypes.MEDIA_PLAYBACK_RATE_REQUEST,
        detail: rate,
      });
    },
    [dispatch],
  );

  return (
    <DropdownMenu
      modal={modal}
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange}
    >
      <MediaPlayerTooltip tooltip="Playback speed" shortcut={["<", ">"]}>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            aria-controls={context.mediaId}
            disabled={isDisabled}
            {...playbackSpeedProps}
            variant="ghost"
            size="icon"
            className={cn(
              "h-8 w-16 aria-[expanded=true]:bg-accent/50",
              className,
            )}
          >
            {mediaPlaybackRate}x
          </Button>
        </DropdownMenuTrigger>
      </MediaPlayerTooltip>
      <DropdownMenuContent
        align="center"
        container={context.portalContainer}
        className="min-w-[var(--radix-dropdown-menu-trigger-width)]"
        sideOffset={sideOffset}
      >
        {speeds.map((speed) => (
          <DropdownMenuItem
            key={speed}
            className="justify-between"
            onSelect={() => onPlaybackRateChange(speed)}
          >
            {speed}x{mediaPlaybackRate === speed && <CheckIcon />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
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
        aria-controls={context.mediaId}
        aria-label={isLooping ? "Disable loop" : "Enable loop"}
        aria-pressed={isLooping}
        data-disabled={isDisabled ? "" : undefined}
        data-slot="media-player-loop"
        data-state={isLooping ? "on" : "off"}
        disabled={isDisabled}
        {...loopProps}
        variant="ghost"
        size="icon"
        className={cn("size-8", className)}
        onClick={onLoopToggle}
      >
        {children ??
          (isLooping ? (
            <RepeatIcon className="text-muted-foreground" />
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
        data-slot="media-player-fullscreen"
        data-state={isFullscreen ? "on" : "off"}
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
        data-slot="media-player-pip"
        data-state={isPictureInPicture ? "on" : "off"}
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

  const onCaptionsToggle = React.useCallback(
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
        aria-controls={context.mediaId}
        aria-label={showingSubtitles ? "Disable captions" : "Enable captions"}
        aria-pressed={showingSubtitles}
        data-disabled={isDisabled ? "" : undefined}
        data-slot="media-player-captions"
        data-state={showingSubtitles ? "on" : "off"}
        disabled={isDisabled}
        {...captionsProps}
        variant="ghost"
        size="icon"
        className={cn("size-8", className)}
        onClick={onCaptionsToggle}
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
        aria-controls={context.mediaId}
        aria-label="Download"
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

interface MediaPlayerSettingsProps extends MediaPlayerPlaybackSpeedProps {}

function MediaPlayerSettings(props: MediaPlayerSettingsProps) {
  const {
    open,
    defaultOpen,
    onOpenChange,
    sideOffset = POPOVER_SIDE_OFFSET,
    speeds = SPEEDS,
    asChild,
    modal = false,
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
  const mediaRenditionList = useMediaSelector(
    (state) => state.mediaRenditionList ?? [],
  );
  const mediaRenditionSelected = useMediaSelector(
    (state) => state.mediaRenditionSelected,
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

  const onRenditionChange = React.useCallback(
    (renditionId: string) => {
      dispatch({
        type: MediaActionTypes.MEDIA_RENDITION_REQUEST,
        detail: renditionId === "auto" ? undefined : renditionId,
      });
    },
    [dispatch],
  );

  const onSubtitlesToggle = React.useCallback(() => {
    dispatch({
      type: MediaActionTypes.MEDIA_TOGGLE_SUBTITLES_REQUEST,
      detail: false,
    });
  }, [dispatch]);

  const onShowSubtitleTrack = React.useCallback(
    (subtitleTrack: (typeof mediaSubtitlesList)[number]) => {
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
      return mediaSubtitlesShowing[0]?.label ?? "On";
    }
    return "Off";
  }, [subtitlesOff, mediaSubtitlesShowing]);

  const getCurrentQualityLabel = React.useCallback(() => {
    if (!mediaRenditionSelected) return "Auto";

    const currentRendition = mediaRenditionList?.find(
      (rendition) => rendition.id === mediaRenditionSelected,
    );
    if (!currentRendition) return "Auto";

    if (currentRendition.height && currentRendition.width)
      return `${currentRendition.height}×${currentRendition.width}`;
    if (currentRendition.height) return `${currentRendition.height}p`;
    if (currentRendition.width) return `${currentRendition.width}p`;
    return currentRendition.id ?? "Auto";
  }, [mediaRenditionSelected, mediaRenditionList]);

  return (
    <DropdownMenu
      modal={modal}
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange}
    >
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
            className={cn(
              "size-8 aria-[expanded=true]:bg-accent/50",
              className,
            )}
          >
            <SettingsIcon />
          </Button>
        </DropdownMenuTrigger>
      </MediaPlayerTooltip>
      <DropdownMenuContent
        align="end"
        side="top"
        sideOffset={sideOffset}
        container={context.portalContainer}
        className="w-56"
      >
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
                className="justify-between"
                onSelect={() => onPlaybackRateChange(speed)}
              >
                {speed}x
                {mediaPlaybackRate === speed && (
                  <CheckIcon className="size-4" />
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        {context.isVideo && mediaRenditionList?.length > 0 && (
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <span className="flex-1">Quality</span>
              <Badge variant="outline" className="rounded-sm">
                {getCurrentQualityLabel()}
              </Badge>
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem
                className="justify-between"
                onSelect={() => onRenditionChange("auto")}
              >
                Auto
                {!mediaRenditionSelected && <CheckIcon className="size-4" />}
              </DropdownMenuItem>
              {mediaRenditionList
                .slice()
                .sort((a, b) => {
                  const aHeight = a.height ?? 0;
                  const bHeight = b.height ?? 0;
                  return bHeight - aHeight;
                })
                .map((rendition) => {
                  const label =
                    rendition.height && rendition.width
                      ? `${rendition.height}×${rendition.width}`
                      : rendition.height
                        ? `${rendition.height}p`
                        : rendition.width
                          ? `${rendition.width}p`
                          : (rendition.id ?? "Unknown");

                  const selected = rendition.id === mediaRenditionSelected;

                  return (
                    <DropdownMenuItem
                      key={rendition.id}
                      className="justify-between"
                      onSelect={() => onRenditionChange(rendition.id ?? "")}
                    >
                      {label}
                      {selected && <CheckIcon className="size-4" />}
                    </DropdownMenuItem>
                  );
                })}
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        )}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <span className="flex-1">Captions</span>
            <Badge variant="outline" className="rounded-sm">
              {getCurrentSubtitleLabel()}
            </Badge>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem
              className="justify-between"
              onSelect={onSubtitlesToggle}
            >
              Off
              {subtitlesOff && <CheckIcon className="size-4" />}
            </DropdownMenuItem>
            {mediaSubtitlesList.map((subtitleTrack) => {
              const isSelected = mediaSubtitlesShowing.some(
                (showingSubtitle) =>
                  showingSubtitle.label === subtitleTrack.label,
              );
              return (
                <DropdownMenuItem
                  key={`${subtitleTrack.kind}-${subtitleTrack.label}-${subtitleTrack.language}`}
                  className="justify-between"
                  onSelect={() => onShowSubtitleTrack(subtitleTrack)}
                >
                  {subtitleTrack.label}
                  {isSelected && <CheckIcon className="size-4" />}
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
    (state) => state.mediaRenditionList ?? [],
  );
  const mediaRenditionSelected = useMediaSelector(
    (state) => state.mediaRenditionSelected,
  );

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
    if (!mediaRenditionSelected) return "Auto";

    const currentRendition = mediaRenditionList?.find(
      (rendition) => rendition.id === mediaRenditionSelected,
    );
    if (!currentRendition) return "Auto";

    if (currentRendition.height && currentRendition.width)
      return `${currentRendition.height}×${currentRendition.width}`;
    if (currentRendition.height) return `${currentRendition.height}p`;
    if (currentRendition.width) return `${currentRendition.width}p`;
    return currentRendition.id ?? "Auto";
  }, [mediaRenditionSelected, mediaRenditionList]);

  return (
    <DropdownMenu modal={false}>
      <MediaPlayerTooltip tooltip="Video quality">
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            aria-controls={context.mediaId}
            aria-label="Video quality"
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
      <DropdownMenuContent
        align="end"
        side="top"
        container={context.portalContainer}
        className="w-48"
      >
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
              className="justify-between"
              onSelect={() => onRenditionChange("auto")}
            >
              Auto
              {!mediaRenditionSelected && <CheckIcon className="size-4" />}
            </DropdownMenuItem>
            {mediaRenditionList
              .slice()
              .sort((a, b) => {
                const aHeight = a.height ?? 0;
                const bHeight = b.height ?? 0;
                return bHeight - aHeight;
              })
              .map((rendition) => {
                const label =
                  rendition.height && rendition.width
                    ? `${rendition.height}×${rendition.width}`
                    : rendition.height
                      ? `${rendition.height}p`
                      : rendition.width
                        ? `${rendition.width}p`
                        : (rendition.id ?? "Unknown");

                const selected = rendition.id === mediaRenditionSelected;

                return (
                  <DropdownMenuItem
                    key={rendition.id}
                    className="justify-between"
                    onSelect={() => onRenditionChange(rendition.id ?? "")}
                  >
                    {label}
                    {selected && <CheckIcon className="size-4" />}
                  </DropdownMenuItem>
                );
              })}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

interface MediaPlayerPortalProps {
  children: React.ReactNode;
}

function MediaPlayerPortal({ children }: MediaPlayerPortalProps) {
  const context = useMediaPlayerContext("MediaPlayerPortal");
  if (!context.portalContainer) return null;

  return ReactDOM.createPortal(children, context.portalContainer);
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
  const context = useMediaPlayerContext("MediaPlayerTooltip");

  if (!tooltip && !shortcut) return <>{children}</>;

  return (
    <Tooltip {...props} delayDuration={600}>
      <TooltipTrigger
        className="text-foreground focus-visible:ring-ring/50"
        asChild
      >
        {children}
      </TooltipTrigger>
      <TooltipContent
        container={context.portalContainer}
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
  MediaPlayerSettings,
  MediaPlayerResolution,
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
  MediaPlayerSettings as Settings,
  MediaPlayerResolution as Resolution,
  //
  useMediaSelector as useMediaPlayer,
};
