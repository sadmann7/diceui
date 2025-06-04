"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
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

const LOADING_DELAY_MS = 500;
const FLOATING_MENU_SIDE_OFFSET = 10;
const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

const SEEK_AMOUNT_SHORT = 5;
const SEEK_AMOUNT_LONG = 10;
const SEEK_COLLISION_PADDING = 10;
const SEEK_TOOLTIP_WIDTH_FALLBACK = 240;

const SPRITE_CONTAINER_WIDTH = 224;
const SPRITE_CONTAINER_HEIGHT = 128;

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
  rootRef: React.RefObject<HTMLDivElement | null>;
  mediaRef: React.RefObject<HTMLVideoElement | HTMLAudioElement | null>;
  isMenuOpen: boolean;
  setIsMenuOpen: (open: boolean) => void;
  showVolumeIndicator: boolean;
  portalContainer: Element | DocumentFragment | null;
  tooltipSideOffset: number;
  disabled: boolean;
  withoutTooltip: boolean;
  isVideo: boolean;
}

const MediaPlayerContext = React.createContext<MediaPlayerContextValue | null>(
  null,
);

function useMediaPlayerContext(consumerName: string) {
  const context = React.useContext(MediaPlayerContext);
  if (!context) {
    throw new Error(`\`${consumerName}\` must be used within \`MediaPlayer\``);
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
  onPipError?: (error: unknown, state: "enter" | "exit") => void;
  onFullscreenChange?: (fullscreen: boolean) => void;
  dir?: Direction;
  label?: string;
  tooltipSideOffset?: number;
  asChild?: boolean;
  disabled?: boolean;
  withoutTooltip?: boolean;
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
    tooltipSideOffset = FLOATING_MENU_SIDE_OFFSET,
    asChild,
    disabled = false,
    withoutTooltip = false,
    children,
    className,
    ref,
    ...rootImplProps
  } = props;

  const mediaId = React.useId();
  const labelId = React.useId();
  const descriptionId = React.useId();

  const rootRef = React.useRef<HTMLDivElement | null>(null);
  const fullscreenRef = useMediaFullscreenRef();
  const composedRef = useComposedRefs(ref, rootRef, fullscreenRef);

  const dir = useDirection(dirProp);
  const dispatch = useMediaDispatch();
  const mediaRef = React.useRef<HTMLVideoElement | HTMLAudioElement | null>(
    null,
  );

  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [showVolumeIndicator, setShowVolumeIndicator] = React.useState(false);
  const volumeIndicatorTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const [mounted, setMounted] = React.useState(false);
  React.useLayoutEffect(() => setMounted(true), []);

  const isFullscreen = useMediaSelector(
    (state) => state.mediaIsFullscreen ?? false,
  );

  const portalContainer = mounted
    ? isFullscreen
      ? rootRef.current
      : globalThis.document.body
    : null;

  const isVideo = React.useMemo(() => {
    if (!mediaRef.current) return false;
    return mediaRef.current instanceof HTMLVideoElement;
  }, []);

  const onVolumeIndicatorTrigger = React.useCallback(() => {
    setShowVolumeIndicator(true);

    if (volumeIndicatorTimeoutRef.current) {
      clearTimeout(volumeIndicatorTimeoutRef.current);
    }

    volumeIndicatorTimeoutRef.current = setTimeout(() => {
      setShowVolumeIndicator(false);
    }, 2000);
  }, []);

  const contextValue = React.useMemo<MediaPlayerContextValue>(
    () => ({
      mediaId,
      labelId,
      descriptionId,
      dir,
      rootRef,
      mediaRef,
      isMenuOpen,
      setIsMenuOpen,
      showVolumeIndicator,
      portalContainer,
      tooltipSideOffset,
      disabled,
      isVideo,
      withoutTooltip,
    }),
    [
      mediaId,
      labelId,
      descriptionId,
      dir,
      isMenuOpen,
      showVolumeIndicator,
      portalContainer,
      tooltipSideOffset,
      disabled,
      isVideo,
      withoutTooltip,
    ],
  );

  React.useEffect(() => {
    const mediaElement = mediaRef.current;
    if (!mediaElement) return;

    const onPlay = () => onPlayProp?.();
    const onPause = () => onPauseProp?.();
    const onEnded = () => onEndedProp?.();
    const onTimeUpdate = () => onTimeUpdateProp?.(mediaElement.currentTime);
    const onVolumeChange = () => {
      onVolumeChangeProp?.(mediaElement.volume);
      onMuted?.(mediaElement.muted);
    };

    mediaElement.addEventListener("play", onPlay);
    mediaElement.addEventListener("pause", onPause);
    mediaElement.addEventListener("ended", onEnded);
    mediaElement.addEventListener("timeupdate", onTimeUpdate);
    mediaElement.addEventListener("volumechange", onVolumeChange);

    return () => {
      mediaElement.removeEventListener("play", onPlay);
      mediaElement.removeEventListener("pause", onPause);
      mediaElement.removeEventListener("ended", onEnded);
      mediaElement.removeEventListener("timeupdate", onTimeUpdate);
      mediaElement.removeEventListener("volumechange", onVolumeChange);
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

  React.useEffect(() => {
    return () => {
      if (volumeIndicatorTimeoutRef.current) {
        clearTimeout(volumeIndicatorTimeoutRef.current);
      }
    };
  }, []);

  const onKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (disabled) return;

      rootImplProps.onKeyDown?.(event);

      if (event.defaultPrevented) return;

      const mediaElement = mediaRef.current;
      if (!mediaElement) return;

      const isMediaFocused = document.activeElement === mediaElement;
      const isPlayerFocused =
        document.activeElement?.closest('[data-slot="media-player"]') !== null;

      if (!isMediaFocused && !isPlayerFocused) return;

      switch (event.key.toLowerCase()) {
        case " ":
        case "k":
          event.preventDefault();
          dispatch({
            type: mediaElement.paused
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
          if (mediaElement instanceof HTMLVideoElement) {
            onVolumeIndicatorTrigger();
          }
          dispatch({
            type: mediaElement.muted
              ? MediaActionTypes.MEDIA_UNMUTE_REQUEST
              : MediaActionTypes.MEDIA_MUTE_REQUEST,
          });
          break;
        }

        case "arrowright":
          event.preventDefault();
          if (
            mediaElement instanceof HTMLVideoElement ||
            (mediaElement instanceof HTMLAudioElement && event.shiftKey)
          ) {
            dispatch({
              type: MediaActionTypes.MEDIA_SEEK_REQUEST,
              detail: Math.min(
                mediaElement.duration,
                mediaElement.currentTime + SEEK_AMOUNT_SHORT,
              ),
            });
          }
          break;

        case "arrowleft":
          event.preventDefault();
          if (
            mediaElement instanceof HTMLVideoElement ||
            (mediaElement instanceof HTMLAudioElement && event.shiftKey)
          ) {
            dispatch({
              type: MediaActionTypes.MEDIA_SEEK_REQUEST,
              detail: Math.max(0, mediaElement.currentTime - SEEK_AMOUNT_SHORT),
            });
          }
          break;

        case "arrowup":
          event.preventDefault();
          if (mediaElement instanceof HTMLVideoElement) {
            onVolumeIndicatorTrigger();
            dispatch({
              type: MediaActionTypes.MEDIA_VOLUME_REQUEST,
              detail: Math.min(1, mediaElement.volume + 0.1),
            });
          }
          break;

        case "arrowdown":
          event.preventDefault();
          if (mediaElement instanceof HTMLVideoElement) {
            onVolumeIndicatorTrigger();
            dispatch({
              type: MediaActionTypes.MEDIA_VOLUME_REQUEST,
              detail: Math.max(0, mediaElement.volume - 0.1),
            });
          }
          break;

        case "<": {
          event.preventDefault();
          const currentRate = mediaElement.playbackRate;
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
          const currentRate = mediaElement.playbackRate;
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
            mediaElement instanceof HTMLVideoElement &&
            mediaElement.textTracks.length > 0
          ) {
            dispatch({
              type: MediaActionTypes.MEDIA_TOGGLE_SUBTITLES_REQUEST,
            });
          }
          break;

        case "d": {
          const hasDownload = mediaElement.querySelector(
            '[data-slot="media-player-download"]',
          );

          if (!hasDownload) break;

          event.preventDefault();
          if (mediaElement.currentSrc) {
            const link = document.createElement("a");
            link.href = mediaElement.currentSrc;
            link.download = "";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }
          break;
        }

        case "p": {
          event.preventDefault();
          if (mediaElement instanceof HTMLVideoElement) {
            const isPip = document.pictureInPictureElement === mediaElement;
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
              mediaElement.requestPictureInPicture().catch((error) => {
                onPipError?.(error, "enter");
              });
            }
          }
          break;
        }

        case "r": {
          event.preventDefault();
          mediaElement.loop = !mediaElement.loop;
          break;
        }

        case "j": {
          event.preventDefault();
          dispatch({
            type: MediaActionTypes.MEDIA_SEEK_REQUEST,
            detail: Math.max(0, mediaElement.currentTime - SEEK_AMOUNT_LONG),
          });
          break;
        }

        case "l": {
          event.preventDefault();
          dispatch({
            type: MediaActionTypes.MEDIA_SEEK_REQUEST,
            detail: Math.min(
              mediaElement.duration,
              mediaElement.currentTime + SEEK_AMOUNT_LONG,
            ),
          });
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
          const seekTime = mediaElement.duration * percent;
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
            detail: mediaElement.duration,
          });
          break;
        }
      }
    },
    [
      dispatch,
      rootImplProps.onKeyDown,
      onPipError,
      onVolumeIndicatorTrigger,
      disabled,
    ],
  );

  const onKeyUp = React.useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      rootImplProps.onKeyUp?.(event);

      const key = event.key.toLowerCase();
      if (key === "arrowup" || key === "arrowdown" || key === "m") {
        onVolumeIndicatorTrigger();
      }
    },
    [rootImplProps.onKeyUp, onVolumeIndicatorTrigger],
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
        {...rootImplProps}
        ref={composedRef}
        onKeyDown={onKeyDown}
        onKeyUp={onKeyUp}
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
        <MediaPlayerVolumeIndicator />
      </RootPrimitive>
    </MediaPlayerContext.Provider>
  );
}

interface MediaPlayerVideoProps extends React.ComponentProps<"video"> {
  asChild?: boolean;
}

function MediaPlayerVideo(props: MediaPlayerVideoProps) {
  const { asChild, children, ref, ...videoProps } = props;

  const context = useMediaPlayerContext("MediaPlayerVideo");
  const dispatch = useMediaDispatch();
  const mediaRefCallback = useMediaRef();
  const composedRef = useComposedRefs(ref, context.mediaRef, mediaRefCallback);

  const onPlayToggle = React.useCallback(
    (event: React.MouseEvent<HTMLVideoElement>) => {
      props.onClick?.(event);

      if (event.defaultPrevented) return;

      const mediaElement = event.currentTarget;
      if (!mediaElement) return;

      dispatch({
        type: mediaElement.paused
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
  const { asChild, children, ref, ...audioProps } = props;

  const context = useMediaPlayerContext("MediaPlayerAudio");
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

  const context = useMediaPlayerContext("MediaPlayerControls");
  const isFullscreen = useMediaSelector(
    (state) => state.mediaIsFullscreen ?? false,
  );

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

  const isFullscreen = useMediaSelector(
    (state) => state.mediaIsFullscreen ?? false,
  );

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

  const isLoading = useMediaSelector((state) => state.mediaLoading ?? false);
  const isPaused = useMediaSelector((state) => state.mediaPaused ?? true);
  const hasPlayed = useMediaSelector((state) => state.mediaHasPlayed ?? false);

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
        timeoutRef.current = null;
      }
    };
  }, []);

  if (!shouldRender) return null;

  const LoadingPrimitive = asChild ? Slot : "div";

  return (
    <LoadingPrimitive
      role="status"
      aria-live="polite"
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
      {variant === "spinner" ? (
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
      ) : variant === "dots" ? (
        <div className="flex items-center gap-1">
          <div className="size-3 animate-bounce rounded-full bg-primary [animation-delay:-0.3s]" />
          <div className="size-3 animate-bounce rounded-full bg-primary [animation-delay:-0.15s]" />
          <div className="size-3 animate-bounce rounded-full bg-primary" />
        </div>
      ) : (
        <Loader2Icon className="size-12 animate-spin text-primary" />
      )}
    </LoadingPrimitive>
  );
}

interface MediaPlayerVolumeIndicatorProps extends React.ComponentProps<"div"> {
  asChild?: boolean;
}

function MediaPlayerVolumeIndicator(props: MediaPlayerVolumeIndicatorProps) {
  const { asChild, className, ...indicatorProps } = props;

  const context = useMediaPlayerContext("MediaPlayerVolumeIndicator");
  const mediaVolume = useMediaSelector((state) => state.mediaVolume ?? 1);
  const mediaMuted = useMediaSelector((state) => state.mediaMuted ?? false);
  const mediaVolumeLevel = useMediaSelector(
    (state) => state.mediaVolumeLevel ?? "high",
  );

  if (!context.showVolumeIndicator) return null;

  const effectiveVolume = mediaMuted ? 0 : mediaVolume;
  const volumePercentage = Math.round(effectiveVolume * 100);
  const barCount = 10;
  const activeBars = Math.ceil(effectiveVolume * barCount);

  const VolumeIndicatorPrimitive = asChild ? Slot : "div";

  return (
    <MediaPlayerPortal>
      <VolumeIndicatorPrimitive
        role="status"
        aria-live="polite"
        aria-label={`Volume ${mediaMuted ? "muted" : `${volumePercentage}%`}`}
        data-slot="media-player-volume-indicator"
        {...indicatorProps}
        className={cn(
          "pointer-events-none absolute inset-0 z-40 flex items-center justify-center transition-opacity duration-200",
          "[:fullscreen_&]:z-50",
          className,
        )}
      >
        <div className="fade-in-0 zoom-in-95 flex animate-in flex-col items-center gap-3 rounded-lg bg-black/75 px-6 py-4 text-white shadow-lg backdrop-blur-sm duration-200">
          <div className="flex items-center gap-2">
            {mediaVolumeLevel === "off" || mediaMuted ? (
              <VolumeXIcon className="size-6" />
            ) : mediaVolumeLevel === "high" ? (
              <Volume2Icon className="size-6" />
            ) : (
              <Volume1Icon className="size-6" />
            )}
            <span className="font-medium text-sm tabular-nums">
              {mediaMuted ? "Muted" : `${volumePercentage}%`}
            </span>
          </div>
          <div className="flex items-center gap-1">
            {Array.from({ length: barCount }, (_, index) => (
              <div
                key={index}
                className={cn(
                  "w-1.5 rounded-full transition-all duration-150",
                  index < activeBars && !mediaMuted
                    ? "scale-100 bg-white"
                    : "scale-90 bg-white/30",
                )}
                style={{
                  height: `${12 + index * 2}px`,
                  animationDelay: `${index * 50}ms`,
                }}
              />
            ))}
          </div>
        </div>
      </VolumeIndicatorPrimitive>
    </MediaPlayerPortal>
  );
}

interface MediaPlayerPlayProps extends React.ComponentProps<typeof Button> {}

function MediaPlayerPlay(props: MediaPlayerPlayProps) {
  const { asChild, children, className, disabled, ...playButtonProps } = props;

  const context = useMediaPlayerContext("MediaPlayerPlay");
  const dispatch = useMediaDispatch();
  const mediaPaused = useMediaSelector((state) => state.mediaPaused ?? true);

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

  const context = useMediaPlayerContext("MediaPlayerSeekBackward");
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

  const context = useMediaPlayerContext("MediaPlayerSeekForward");
  const dispatch = useMediaDispatch();
  const mediaCurrentTime = useMediaSelector(
    (state) => state.mediaCurrentTime ?? 0,
  );
  const [, seekableEnd] = useMediaSelector(
    (state) => state.mediaSeekable ?? [0, 0],
  );
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
        className={cn("size-8", className)}
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
  withTime?: boolean;
  withoutChapter?: boolean;
  withoutTooltip?: boolean;
  tooltipThumbnailSrc?: string | ((time: number) => string);
  tooltipVariant?: "time" | "time-duration";
  tooltipSideOffset?: number;
  tooltipCollisionBoundary?: Element | Element[];
  tooltipCollisionPadding?:
    | number
    | Partial<Record<"top" | "right" | "bottom" | "left", number>>;
}

function MediaPlayerSeek(props: MediaPlayerSeekProps) {
  const {
    withTime = false,
    withoutChapter = false,
    withoutTooltip = false,
    tooltipVariant = "time",
    tooltipThumbnailSrc,
    tooltipSideOffset,
    tooltipCollisionPadding = SEEK_COLLISION_PADDING,
    tooltipCollisionBoundary,
    className,
    disabled,
    ...seekProps
  } = props;

  const context = useMediaPlayerContext("MediaPlayerSeek");
  const dispatch = useMediaDispatch();
  const mediaCurrentTime = useMediaSelector(
    (state) => state.mediaCurrentTime ?? 0,
  );
  const [seekableStart = 0, seekableEnd = 0] = useMediaSelector(
    (state) => state.mediaSeekable ?? [0, 0],
  );
  const mediaBuffered = useMediaSelector((state) => state.mediaBuffered ?? []);
  const mediaEnded = useMediaSelector((state) => state.mediaEnded ?? false);

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
  const justCommittedRef = React.useRef<boolean>(false);

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

  const formattedCurrentTime = React.useMemo(
    () => timeUtils.formatTime(displayValue, seekableEnd),
    [displayValue, seekableEnd],
  );
  const formattedDuration = React.useMemo(
    () => timeUtils.formatTime(seekableEnd, seekableEnd),
    [seekableEnd],
  );
  const formattedHoverTime = React.useMemo(
    () => timeUtils.formatTime(seekState.hoverTime, seekableEnd),
    [seekState.hoverTime, seekableEnd],
  );
  const formattedRemainingTime = React.useMemo(
    () => timeUtils.formatTime(seekableEnd - displayValue, seekableEnd),
    [displayValue, seekableEnd],
  );

  const isDisabled = disabled || context.disabled;

  const tooltipDisabled =
    withoutTooltip || context.withoutTooltip || context.isMenuOpen;

  const currentTooltipSideOffset =
    tooltipSideOffset ?? context.tooltipSideOffset;

  const getCurrentChapterCue = React.useCallback(
    (time: number) => {
      if (withoutChapter || chapterCues.length === 0) return null;
      return chapterCues.find((c) => time >= c.startTime && time < c.endTime);
    },
    [chapterCues, withoutChapter],
  );

  const getThumbnail = React.useCallback(
    (time: number) => {
      if (tooltipDisabled) return null;

      if (tooltipThumbnailSrc) {
        const src =
          typeof tooltipThumbnailSrc === "function"
            ? tooltipThumbnailSrc(time)
            : tooltipThumbnailSrc;
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
      tooltipThumbnailSrc,
      mediaPreviewTime,
      mediaPreviewImage,
      mediaPreviewCoords,
      tooltipDisabled,
    ],
  );

  const onPreviewUpdate = React.useCallback(
    (time: number) => {
      if (tooltipDisabled) return;

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
    [dispatch, tooltipDisabled],
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
    if (!seekState.isHovering || tooltipDisabled) return;

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
  }, [dispatch, seekState.isHovering, tooltipDisabled]);

  const bufferedProgress = React.useMemo(() => {
    if (mediaBuffered.length === 0 || seekableEnd <= 0) return 0;

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
    if (typeof tooltipCollisionPadding === "number") {
      return {
        top: tooltipCollisionPadding,
        right: tooltipCollisionPadding,
        bottom: tooltipCollisionPadding,
        left: tooltipCollisionPadding,
      };
    }
    return {
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      ...tooltipCollisionPadding,
    };
  }, [tooltipCollisionPadding]);

  const getCollisionBoundaries = React.useCallback(() => {
    if (tooltipCollisionBoundary) {
      return Array.isArray(tooltipCollisionBoundary)
        ? tooltipCollisionBoundary
        : [tooltipCollisionBoundary];
    }
    return [context.rootRef.current].filter(Boolean) as Element[];
  }, [tooltipCollisionBoundary, context.rootRef]);

  const onTooltipPositionUpdate = React.useCallback(
    (clientX: number) => {
      if (!seekRef.current) return;

      const tooltipWidth =
        tooltipRef.current?.offsetWidth ?? SEEK_TOOLTIP_WIDTH_FALLBACK;
      const seekRect = seekRef.current.getBoundingClientRect();

      let x = clientX;
      const y = seekRect.top;

      const padding = getCollisionPadding();
      const boundaries = getCollisionBoundaries();

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

      const viewportPadding = SEEK_COLLISION_PADDING;
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
    [getCollisionPadding, getCollisionBoundaries],
  );

  const onPointerEnter = React.useCallback(() => {
    if (justCommittedRef.current) return;

    if (seekableEnd > 0) {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }

      if (!tooltipDisabled) {
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
      } else {
        setSeekState((prev) => ({ ...prev, isHovering: true }));
      }
    }
  }, [seekableEnd, onTooltipPositionUpdate, tooltipDisabled]);

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

    justCommittedRef.current = false;

    if (!tooltipDisabled) {
      dispatch({
        type: MediaActionTypes.MEDIA_PREVIEW_REQUEST,
        detail: undefined,
      });
    }
  }, [dispatch, tooltipDisabled]);

  const onPointerMove = React.useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (!seekRef.current || seekableEnd <= 0) return;

      lastPointerXRef.current = event.clientX;

      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }

      rafIdRef.current = requestAnimationFrame(() => {
        if (justCommittedRef.current) {
          justCommittedRef.current = false;
          rafIdRef.current = null;
          return;
        }

        const seekRect = seekRef.current?.getBoundingClientRect();
        if (!seekRect) {
          rafIdRef.current = null;
          return;
        }

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

        if (!tooltipDisabled) {
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
      tooltipDisabled,
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
        pendingSeekTime: time,
        isHovering: false,
        tooltipPosition: null,
        hasInitialPosition: false,
      }));

      justCommittedRef.current = true;

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
  const thumbnail = getThumbnail(seekState.hoverTime);

  const tooltipStyle = React.useMemo<React.CSSProperties>(() => {
    if (!seekState.tooltipPosition || !seekState.isHovering) {
      return {
        visibility: "hidden",
        opacity: 0,
        pointerEvents: "none",
        position: "fixed" as const,
        left: seekState.tooltipPosition?.x ?? 0,
        top: seekState.tooltipPosition?.y ?? 0,
        transform: `translateX(-50%) translateY(calc(-100% - ${currentTooltipSideOffset}px))`,
        transition: "none",
        willChange: "opacity",
      };
    }

    return {
      left: `${seekState.tooltipPosition.x}px`,
      top: `${seekState.tooltipPosition.y}px`,
      position: "fixed" as const,
      transform: `translateX(-50%) translateY(calc(-100% - ${currentTooltipSideOffset}px))`,
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
    currentTooltipSideOffset,
  ]);

  const spriteStyle = React.useMemo<React.CSSProperties>(() => {
    if (!thumbnail?.coords || !thumbnail?.src) {
      return {};
    }

    const coordX = thumbnail.coords[0];
    const coordY = thumbnail.coords[1];

    const spriteWidth = Number.parseFloat(thumbnail.coords[2] ?? "0");
    const spriteHeight = Number.parseFloat(thumbnail.coords[3] ?? "0");

    const scaleX = spriteWidth > 0 ? SPRITE_CONTAINER_WIDTH / spriteWidth : 1;
    const scaleY =
      spriteHeight > 0 ? SPRITE_CONTAINER_HEIGHT / spriteHeight : 1;
    const scale = Math.min(scaleX, scaleY);

    return {
      width: `${spriteWidth}px`,
      height: `${spriteHeight}px`,
      backgroundImage: `url(${thumbnail.src})`,
      backgroundPosition: `-${coordX}px -${coordY}px`,
      backgroundRepeat: "no-repeat",
      transform: `scale(${scale})`,
      transformOrigin: "top left",
    };
  }, [thumbnail?.coords, thumbnail?.src]);

  const chapterSeparators = React.useMemo(() => {
    if (withoutChapter || chapterCues.length <= 1 || seekableEnd <= 0) {
      return null;
    }

    return chapterCues.slice(1).map((chapterCue, index) => {
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
    });
  }, [chapterCues, seekableEnd, withoutChapter]);

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
          {chapterSeparators}
        </SliderPrimitive.Track>
        <SliderPrimitive.Thumb className="relative z-10 block size-2.5 shrink-0 rounded-full bg-primary shadow-sm ring-ring/50 transition-[color,box-shadow] will-change-transform hover:ring-4 focus-visible:outline-hidden focus-visible:ring-4 disabled:pointer-events-none disabled:opacity-50" />
      </SliderPrimitive.Root>
      {!withoutTooltip &&
        !context.withoutTooltip &&
        (seekState.isHovering || seekState.tooltipPosition) &&
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
                  thumbnail && "min-h-10",
                  !thumbnail && currentChapterCue && "px-3 py-1.5",
                )}
              >
                {thumbnail?.src && (
                  <div
                    data-slot="media-player-seek-thumbnail"
                    className="overflow-hidden rounded-md rounded-b-none"
                    style={{
                      width: `${SPRITE_CONTAINER_WIDTH}px`,
                      height: `${SPRITE_CONTAINER_HEIGHT}px`,
                    }}
                  >
                    {thumbnail.coords ? (
                      <div style={spriteStyle} />
                    ) : (
                      <img
                        src={thumbnail.src}
                        alt={`Preview at ${formattedHoverTime}`}
                        className="size-full object-cover"
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
                    thumbnail && "pb-1.5",
                    !(thumbnail || currentChapterCue) && "px-2.5 py-1",
                    "flex items-center",
                  )}
                >
                  {tooltipVariant === "time-duration"
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

  const context = useMediaPlayerContext("MediaPlayerVolume");
  const dispatch = useMediaDispatch();
  const mediaVolume = useMediaSelector((state) => state.mediaVolume ?? 1);
  const mediaMuted = useMediaSelector((state) => state.mediaMuted ?? false);
  const mediaVolumeLevel = useMediaSelector(
    (state) => state.mediaVolumeLevel ?? "high",
  );

  const sliderId = React.useId();
  const volumeTriggerId = React.useId();

  const isDisabled = disabled || context.disabled;

  const onMute = React.useCallback(() => {
    dispatch({
      type: mediaMuted
        ? MediaActionTypes.MEDIA_UNMUTE_REQUEST
        : MediaActionTypes.MEDIA_MUTE_REQUEST,
    });
  }, [dispatch, mediaMuted]);

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

  const effectiveVolume = mediaMuted ? 0 : mediaVolume;

  return (
    <div
      role="group"
      data-disabled={isDisabled ? "" : undefined}
      className={cn(
        "group flex items-center",
        expandable
          ? "gap-0 group-focus-within:gap-2 group-hover:gap-1.5"
          : "gap-1.5",
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
  variant?: "progress" | "remaining" | "duration";
  asChild?: boolean;
}

function MediaPlayerTime(props: MediaPlayerTimeProps) {
  const { variant = "progress", asChild, className, ...timeProps } = props;

  const context = useMediaPlayerContext("MediaPlayerTime");
  const mediaCurrentTime = useMediaSelector(
    (state) => state.mediaCurrentTime ?? 0,
  );
  const [, seekableEnd = 0] = useMediaSelector(
    (state) => state.mediaSeekable ?? [0, 0],
  );

  const formattedCurrentTime = React.useMemo(
    () => timeUtils.formatTime(mediaCurrentTime, seekableEnd),
    [mediaCurrentTime, seekableEnd],
  );
  const formattedDuration = React.useMemo(
    () => timeUtils.formatTime(seekableEnd, seekableEnd),
    [seekableEnd],
  );
  const formattedRemainingTime = React.useMemo(
    () => timeUtils.formatTime(seekableEnd - mediaCurrentTime, seekableEnd),
    [mediaCurrentTime, seekableEnd],
  );

  const TimePrimitive = asChild ? Slot : "div";

  if (variant === "remaining" || variant === "duration") {
    return (
      <TimePrimitive
        data-slot="media-player-time"
        data-variant={variant}
        dir={context.dir}
        {...timeProps}
        className={cn("text-foreground/80 text-sm tabular-nums", className)}
      >
        {variant === "remaining" ? formattedRemainingTime : formattedDuration}
      </TimePrimitive>
    );
  }

  return (
    <TimePrimitive
      data-slot="media-player-time"
      data-variant={variant}
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
    onOpenChange: onOpenChangeProp,
    sideOffset = FLOATING_MENU_SIDE_OFFSET,
    speeds = SPEEDS,
    asChild,
    modal = false,
    className,
    disabled,
    ...playbackSpeedProps
  } = props;

  const context = useMediaPlayerContext("MediaPlayerPlaybackSpeed");
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

  const onOpenChange = React.useCallback(
    (open: boolean) => {
      context.setIsMenuOpen(open);
      onOpenChangeProp?.(open);
    },
    [context.setIsMenuOpen, onOpenChangeProp],
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
        container={context.portalContainer}
        sideOffset={sideOffset}
        align="center"
        className="min-w-[var(--radix-dropdown-menu-trigger-width)] data-[side=top]:mb-3.5"
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

  const context = useMediaPlayerContext("MediaPlayerLoop");
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

  const context = useMediaPlayerContext("MediaPlayerFullscreen");
  const dispatch = useMediaDispatch();
  const isFullscreen = useMediaSelector(
    (state) => state.mediaIsFullscreen ?? false,
  );

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
  onPipError?: (error: unknown, state: "enter" | "exit") => void;
}

function MediaPlayerPiP(props: MediaPlayerPiPProps) {
  const { children, className, onPipError, disabled, ...pipButtonProps } =
    props;

  const context = useMediaPlayerContext("MediaPlayerPiP");
  const dispatch = useMediaDispatch();
  const isPictureInPicture = useMediaSelector(
    (state) => state.mediaIsPip ?? false,
  );

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
        aria-controls={context.mediaId}
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

  const context = useMediaPlayerContext("MediaPlayerCaptions");
  const dispatch = useMediaDispatch();
  const isSubtitlesActive = useMediaSelector(
    (state) => (state.mediaSubtitlesShowing ?? []).length > 0,
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
        aria-label={isSubtitlesActive ? "Disable captions" : "Enable captions"}
        aria-pressed={isSubtitlesActive}
        data-disabled={isDisabled ? "" : undefined}
        data-slot="media-player-captions"
        data-state={isSubtitlesActive ? "on" : "off"}
        disabled={isDisabled}
        {...captionsProps}
        variant="ghost"
        size="icon"
        className={cn("size-8", className)}
        onClick={onCaptionsToggle}
      >
        {children ??
          (isSubtitlesActive ? <SubtitlesIcon /> : <CaptionsOffIcon />)}
      </Button>
    </MediaPlayerTooltip>
  );
}

interface MediaPlayerDownloadProps
  extends React.ComponentProps<typeof Button> {}

function MediaPlayerDownload(props: MediaPlayerDownloadProps) {
  const { children, className, disabled, ...downloadProps } = props;

  const context = useMediaPlayerContext("MediaPlayerDownload");

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
    onOpenChange: onOpenChangeProp,
    sideOffset = FLOATING_MENU_SIDE_OFFSET,
    speeds = SPEEDS,
    asChild,
    modal = false,
    className,
    disabled,
    ...settingsProps
  } = props;

  const context = useMediaPlayerContext("MediaPlayerSettings");
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
  const isSubtitlesActive = (mediaSubtitlesShowing ?? []).length > 0;

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
    if (!isSubtitlesActive) return "Off";
    if (mediaSubtitlesShowing.length > 0) {
      return mediaSubtitlesShowing[0]?.label ?? "On";
    }
    return "Off";
  }, [isSubtitlesActive, mediaSubtitlesShowing]);

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

  const onOpenChange = React.useCallback(
    (open: boolean) => {
      context.setIsMenuOpen(open);
      onOpenChangeProp?.(open);
    },
    [context.setIsMenuOpen, onOpenChangeProp],
  );

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
            aria-controls={context.mediaId}
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
        className="w-56 data-[side=top]:mb-3.5"
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
                {speed}x{mediaPlaybackRate === speed && <CheckIcon />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        {context.isVideo && mediaRenditionList.length > 0 && (
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
                {!mediaRenditionSelected && <CheckIcon />}
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
                      {selected && <CheckIcon />}
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
              {!isSubtitlesActive && <CheckIcon />}
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
                  {isSelected && <CheckIcon />}
                </DropdownMenuItem>
              );
            })}
            {mediaSubtitlesList.length === 0 && (
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

interface MediaPlayerPortalProps {
  container?: Element | DocumentFragment | null;
  children?: React.ReactNode;
}

function MediaPlayerPortal(props: MediaPlayerPortalProps) {
  const { container: containerProp, children } = props;

  const context = useMediaPlayerContext("MediaPlayerPortal");
  const container = containerProp ?? context.portalContainer;

  if (!container) return null;

  return ReactDOM.createPortal(children, container);
}

interface MediaPlayerTooltipProps
  extends React.ComponentProps<typeof Tooltip>,
    Pick<React.ComponentProps<typeof TooltipContent>, "sideOffset"> {
  tooltip?: string;
  shortcut?: string | string[];
}

function MediaPlayerTooltip(props: MediaPlayerTooltipProps) {
  const { tooltip, shortcut, sideOffset, children, ...tooltipProps } = props;

  const context = useMediaPlayerContext("MediaPlayerTooltip");
  const currentSideOffset = sideOffset ?? context.tooltipSideOffset;

  if ((!tooltip && !shortcut) || context.withoutTooltip) return <>{children}</>;

  return (
    <Tooltip {...tooltipProps} delayDuration={600}>
      <TooltipTrigger
        className="text-foreground focus-visible:ring-ring/50"
        asChild
      >
        {children}
      </TooltipTrigger>
      <TooltipContent
        container={context.portalContainer}
        sideOffset={currentSideOffset}
        className="flex items-center gap-2 border bg-accent px-2 py-1 font-medium text-foreground data-[side=top]:mb-3.5 dark:bg-zinc-900 [&>span]:hidden"
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
  MediaPlayerVolumeIndicator,
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
  MediaPlayerPortal,
  MediaPlayerTooltip,
  //
  MediaPlayerRoot as Root,
  MediaPlayerVideo as Video,
  MediaPlayerAudio as Audio,
  MediaPlayerControls as Controls,
  MediaPlayerOverlay as Overlay,
  MediaPlayerLoading as Loading,
  MediaPlayerVolumeIndicator as VolumeIndicator,
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
  MediaPlayerPortal as Portal,
  MediaPlayerTooltip as Tooltip,
  //
  useMediaSelector as useMediaPlayer,
};
