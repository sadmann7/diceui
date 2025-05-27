"use client";
import { Button } from "@/components/ui/button";
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
  DownloadIcon,
  FastForwardIcon,
  Maximize2Icon,
  Minimize2Icon,
  PauseIcon,
  PictureInPicture2Icon,
  PictureInPictureIcon,
  PlayIcon,
  RepeatIcon,
  RewindIcon,
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

const { formatTime } = timeUtils;

const POINTER_MOVE_THROTTLE_MS = 16;
const SEEK_THROTTLE_MS = 100;
const SEEK_AMOUNT_SHORT = 5;
const SEEK_AMOUNT_LONG = 10;
const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

const ROOT_NAME = "MediaPlayer";
const ROOT_IMPL_NAME = "MediaPlayerRootImpl";
const VIDEO_NAME = "MediaPlayerVideo";
const AUDIO_NAME = "MediaPlayerAudio";
const CONTROLS_NAME = "MediaPlayerControls";
const OVERLAY_NAME = "MediaPlayerOverlay";
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
}

const MediaPlayerContext = React.createContext<MediaPlayerContextValue | null>(
  null,
);

function useMediaPlayerContext(
  consumerName: string,
  componentName = ROOT_NAME,
) {
  const context = React.useContext(MediaPlayerContext);
  if (!context) {
    throw new Error(
      `\`${consumerName}\` must be used within \`${componentName}\``,
    );
  }
  return context;
}

interface MediaPlayerRootProps
  extends Omit<
    React.ComponentPropsWithoutRef<"div">,
    "onTimeUpdate" | "onVolumeChange"
  > {
  defaultVolume?: number;
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

const MediaPlayerRoot = React.forwardRef<HTMLDivElement, MediaPlayerRootProps>(
  (props, forwardedRef) => {
    const {
      defaultVolume = 1,
      onPlay,
      onPause,
      onEnded,
      onTimeUpdate,
      onVolumeChange,
      onMuted,
      onPipError,
      onFullscreenChange,
      asChild,
      disabled,
      dir: dirProp,
      label,
      children,
      className,
      ...rootProps
    } = props;

    const dir = useDirection(dirProp);

    return (
      <MediaProvider>
        <MediaPlayerRootImpl
          asChild={asChild}
          disabled={disabled}
          dir={dir}
          label={label}
          className={className}
          onPipError={onPipError}
          onPlay={onPlay}
          onPause={onPause}
          onEnded={onEnded}
          onTimeUpdate={onTimeUpdate}
          onVolumeChange={onVolumeChange}
          onMuted={onMuted}
          onFullscreenChange={onFullscreenChange}
          {...rootProps}
          ref={forwardedRef}
        >
          {children}
        </MediaPlayerRootImpl>
      </MediaProvider>
    );
  },
);
MediaPlayerRoot.displayName = ROOT_NAME;

const MediaPlayerRootImpl = React.forwardRef<
  HTMLDivElement,
  MediaPlayerRootProps
>(
  (
    {
      asChild,
      disabled = false,
      dir: dirProp,
      label,
      className,
      onPipError,
      onPlay: onPlayProp,
      onPause: onPauseProp,
      onEnded: onEndedProp,
      onTimeUpdate: onTimeUpdateProp,
      onFullscreenChange: onFullscreenChangeProp,
      onVolumeChange,
      onMuted,
      children,
      ...containerProps
    },
    forwardedRef,
  ) => {
    const mediaId = React.useId();
    const labelId = React.useId();
    const descriptionId = React.useId();

    const dispatch = useMediaDispatch();
    const fullscreenRefCallback = useMediaFullscreenRef();
    const composedRef = useComposedRefs(forwardedRef, fullscreenRefCallback);

    const mediaRef = React.useRef<HTMLVideoElement | HTMLAudioElement>(null);

    React.useEffect(() => {
      const media = mediaRef.current;
      if (!media) return;

      const onPlay = () => onPlayProp?.();
      const onPause = () => onPauseProp?.();
      const onEnded = () => onEndedProp?.();
      const onTimeUpdate = () => onTimeUpdateProp?.(media.currentTime);
      const handleVolumeChange = () => {
        onVolumeChange?.(media.volume);
        onMuted?.(media.muted);
      };

      media.addEventListener("play", onPlay);
      media.addEventListener("pause", onPause);
      media.addEventListener("ended", onEnded);
      media.addEventListener("timeupdate", onTimeUpdate);
      media.addEventListener("volumechange", handleVolumeChange);

      return () => {
        media.removeEventListener("play", onPlay);
        media.removeEventListener("pause", onPause);
        media.removeEventListener("ended", onEnded);
        media.removeEventListener("timeupdate", onTimeUpdate);
        media.removeEventListener("volumechange", handleVolumeChange);
      };
    }, [
      onPlayProp,
      onPauseProp,
      onEndedProp,
      onTimeUpdateProp,
      onVolumeChange,
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

        containerProps.onKeyDown?.(event);

        if (event.defaultPrevented) return;

        const media = mediaRef.current;
        if (!media) return;

        const isMediaFocused = document.activeElement === media;
        const isPlayerFocused =
          document.activeElement?.closest('[data-slot="media-player"]') !==
          null;

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
        }
      },
      [dispatch, disabled, containerProps.onKeyDown, onPipError],
    );

    React.useEffect(() => {
      const mediaElement = document.querySelector(`#${mediaId}`);

      if (
        mediaElement instanceof HTMLVideoElement ||
        mediaElement instanceof HTMLAudioElement
      ) {
        mediaRef.current = mediaElement;
      }
    }, [mediaId]);

    const dir = useDirection(dirProp);

    const contextValue = React.useMemo<MediaPlayerContextValue>(
      () => ({
        mediaId,
        labelId,
        descriptionId,
        dir,
        disabled,
      }),
      [mediaId, labelId, descriptionId, dir, disabled],
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
          {...containerProps}
          ref={composedRef}
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
  },
);
MediaPlayerRootImpl.displayName = ROOT_IMPL_NAME;

interface MediaPlayerVideoProps
  extends React.ComponentPropsWithoutRef<"video"> {
  asChild?: boolean;
}

const MediaPlayerVideo = React.forwardRef<
  HTMLVideoElement,
  MediaPlayerVideoProps
>((props, forwardedRef) => {
  const { asChild, children, className, ...videoProps } = props;

  const context = useMediaPlayerContext(VIDEO_NAME);
  const dispatch = useMediaDispatch();
  const mediaRefCallback = useMediaRef();
  const composedRef = useComposedRefs(forwardedRef, mediaRefCallback);

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
      ref={composedRef}
      id={context.mediaId}
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
});
MediaPlayerVideo.displayName = VIDEO_NAME;

interface MediaPlayerAudioProps
  extends React.ComponentPropsWithoutRef<"audio"> {
  asChild?: boolean;
}

const MediaPlayerAudio = React.forwardRef<
  HTMLAudioElement,
  MediaPlayerAudioProps
>((props, forwardedRef) => {
  const { asChild, children, className, ...audioProps } = props;

  const context = useMediaPlayerContext(AUDIO_NAME);
  const mediaRefCallback = useMediaRef();
  const composedRef = useComposedRefs(forwardedRef, mediaRefCallback);

  const AudioPrimitive = asChild ? Slot : "audio";

  return (
    <AudioPrimitive
      aria-labelledby={context.labelId}
      aria-describedby={context.descriptionId}
      data-slot="media-player-audio"
      {...audioProps}
      ref={composedRef}
      id={context.mediaId}
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
});
MediaPlayerAudio.displayName = AUDIO_NAME;

interface MediaPlayerControlsProps
  extends React.ComponentPropsWithoutRef<"div"> {
  asChild?: boolean;
}

const MediaPlayerControls = React.forwardRef<
  HTMLDivElement,
  MediaPlayerControlsProps
>((props, forwardedRef) => {
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
      ref={forwardedRef}
      className={cn(
        "dark absolute right-0 bottom-0 left-0 z-50 flex items-center gap-2 px-4 py-3",
        "[:fullscreen_&]:absolute [:fullscreen_&]:right-0 [:fullscreen_&]:bottom-0 [:fullscreen_&]:left-0 [:fullscreen_&]:z-50 [:fullscreen_&]:px-6 [:fullscreen_&]:py-4",
        className,
      )}
      {...controlsProps}
    />
  );
});
MediaPlayerControls.displayName = CONTROLS_NAME;

interface MediaPlayerOverlayProps
  extends React.ComponentPropsWithoutRef<"div"> {
  asChild?: boolean;
}

const MediaPlayerOverlay = React.forwardRef<
  HTMLDivElement,
  MediaPlayerOverlayProps
>((props, forwardedRef) => {
  const { asChild, className, ...overlayProps } = props;

  const isFullscreen = useMediaSelector((state) => state.mediaIsFullscreen);

  const OverlayPrimitive = asChild ? Slot : "div";

  return (
    <OverlayPrimitive
      data-state={isFullscreen ? "fullscreen" : "windowed"}
      data-slot="media-player-overlay"
      {...overlayProps}
      ref={forwardedRef}
      className={cn(
        "-z-10 absolute inset-0 bg-gradient-to-t from-black/80 to-transparent",
        className,
      )}
    />
  );
});
MediaPlayerOverlay.displayName = OVERLAY_NAME;

interface MediaPlayerPlayProps
  extends React.ComponentPropsWithoutRef<typeof Button> {}

const MediaPlayerPlay = React.forwardRef<
  HTMLButtonElement,
  MediaPlayerPlayProps
>((props, forwardedRef) => {
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
        ref={forwardedRef}
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
});
MediaPlayerPlay.displayName = PLAY_NAME;

interface MediaPlayerSeekBackwardProps
  extends React.ComponentPropsWithoutRef<typeof Button> {
  seconds?: number;
}

const MediaPlayerSeekBackward = React.forwardRef<
  HTMLButtonElement,
  MediaPlayerSeekBackwardProps
>((props, forwardedRef) => {
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

  const isVideo =
    typeof window !== "undefined" &&
    document.querySelector(`#${context.mediaId}`) instanceof HTMLVideoElement;

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
      shortcut={isVideo ? ["←"] : ["Shift ←"]}
    >
      <Button
        type="button"
        aria-label={`Back ${seconds} seconds`}
        aria-controls={context.mediaId}
        data-disabled={isDisabled ? "" : undefined}
        data-slot="media-player-seek-backward"
        disabled={isDisabled}
        {...seekBackwardProps}
        ref={forwardedRef}
        variant="ghost"
        size="icon"
        className={cn("size-8", className)}
        onClick={onSeekBackward}
      >
        {children ?? <RewindIcon />}
      </Button>
    </MediaPlayerTooltip>
  );
});
MediaPlayerSeekBackward.displayName = SEEK_BACKWARD_NAME;

interface MediaPlayerSeekForwardProps
  extends React.ComponentPropsWithoutRef<typeof Button> {
  seconds?: number;
}

const MediaPlayerSeekForward = React.forwardRef<
  HTMLButtonElement,
  MediaPlayerSeekForwardProps
>((props, forwardedRef) => {
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

  const isVideo =
    typeof window !== "undefined" &&
    document.querySelector(`#${context.mediaId}`) instanceof HTMLVideoElement;

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
      shortcut={isVideo ? ["→"] : ["Shift →"]}
    >
      <Button
        type="button"
        aria-label={`Forward ${seconds} seconds`}
        aria-controls={context.mediaId}
        data-disabled={isDisabled ? "" : undefined}
        data-slot="media-player-seek-forward"
        disabled={isDisabled}
        {...seekForwardProps}
        ref={forwardedRef}
        variant="ghost"
        size="icon"
        className={cn("size-8", className)}
        onClick={onSeekForward}
      >
        {children ?? <FastForwardIcon />}
      </Button>
    </MediaPlayerTooltip>
  );
});
MediaPlayerSeekForward.displayName = SEEK_FORWARD_NAME;

interface MediaPlayerSeekProps
  extends React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> {
  withTime?: boolean;
}

const MediaPlayerSeek = React.forwardRef<HTMLDivElement, MediaPlayerSeekProps>(
  (props, forwardedRef) => {
    const {
      asChild,
      withTime = false,
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

    const seekRef = React.useRef<HTMLDivElement>(null);
    const tooltipRef = React.useRef<HTMLDivElement>(null);
    const composedRef = useComposedRefs(forwardedRef, seekRef);

    const [tooltipPositionX, setTooltipPositionX] = React.useState(0);
    const [isHoveringSeek, setIsHoveringSeek] = React.useState(false);
    const [hoverTime, setHoverTime] = React.useState(0);

    const formattedCurrentTime = formatTime(mediaCurrentTime, seekableEnd);
    const formattedDuration = formatTime(seekableEnd, seekableEnd);
    const formattedHoverTime = formatTime(hoverTime, seekableEnd);
    const formattedRemainingTime = formatTime(
      seekableEnd - mediaCurrentTime,
      seekableEnd,
    );

    const isDisabled = disabled || context.disabled;

    const pointerMoveThrottleTimeoutRef = React.useRef<NodeJS.Timeout | null>(
      null,
    );
    const seekThrottleTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
    const latestSeekValueRef = React.useRef<number | null>(null);

    const onPointerEnter = React.useCallback(() => {
      if (seekableEnd > 0) {
        setIsHoveringSeek(true);
      }
    }, [seekableEnd]);

    const onPointerLeave = React.useCallback(() => {
      if (pointerMoveThrottleTimeoutRef.current) {
        clearTimeout(pointerMoveThrottleTimeoutRef.current);
        pointerMoveThrottleTimeoutRef.current = null;
      }
      setIsHoveringSeek(false);
    }, []);

    const onPointerMove = React.useCallback(
      (event: React.PointerEvent<HTMLDivElement>) => {
        if (
          !seekRef.current ||
          seekableEnd <= 0 ||
          pointerMoveThrottleTimeoutRef.current
        ) {
          return;
        }

        const rect = seekRef.current.getBoundingClientRect();
        const offsetX = event.clientX - rect.left;
        const clampedOffsetX = Math.max(0, Math.min(offsetX, rect.width));
        const relativeX = clampedOffsetX / rect.width;
        const calculatedHoverTime = relativeX * seekableEnd;

        const tooltipWidth =
          tooltipRef.current?.getBoundingClientRect().width ?? 0;
        const centeredPosition = clampedOffsetX - tooltipWidth / 2;

        setTooltipPositionX(centeredPosition);
        setHoverTime(calculatedHoverTime);

        pointerMoveThrottleTimeoutRef.current = setTimeout(() => {
          pointerMoveThrottleTimeoutRef.current = null;
        }, POINTER_MOVE_THROTTLE_MS);
      },
      [seekableEnd],
    );

    const onSeek = React.useCallback(
      (value: number[]) => {
        const time = value[0] ?? 0;
        latestSeekValueRef.current = time;

        if (!seekThrottleTimeoutRef.current) {
          dispatch({
            type: MediaActionTypes.MEDIA_SEEK_REQUEST,
            detail: time,
          });

          seekThrottleTimeoutRef.current = setTimeout(() => {
            seekThrottleTimeoutRef.current = null;
            if (
              latestSeekValueRef.current !== null &&
              latestSeekValueRef.current !== time
            ) {
              dispatch({
                type: MediaActionTypes.MEDIA_SEEK_REQUEST,
                detail: latestSeekValueRef.current,
              });
            }
          }, SEEK_THROTTLE_MS);
        }
      },
      [dispatch],
    );

    const onSeekCommit = React.useCallback(
      (value: number[]) => {
        const time = value[0] ?? 0;
        if (seekThrottleTimeoutRef.current) {
          clearTimeout(seekThrottleTimeoutRef.current);
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

    const bufferedRanges = React.useMemo(() => {
      if (!mediaBuffered || seekableEnd <= 0) return null;

      return mediaBuffered.map((range, i) => {
        const startPercent = (range[0] / seekableEnd) * 100;
        const widthPercent = ((range[1] - range[0]) / seekableEnd) * 100;

        return (
          <div
            key={i}
            data-slot="media-player-seek-buffered"
            className="absolute h-full bg-zinc-400"
            style={{
              left: `${startPercent}%`,
              width: `${widthPercent}%`,
            }}
          />
        );
      });
    }, [mediaBuffered, seekableEnd]);

    const SeekSlider = (
      <Tooltip delayDuration={100} open={isHoveringSeek}>
        <TooltipTrigger asChild>
          <SliderPrimitive.Root
            aria-label="Seek time"
            aria-valuetext={`${formattedCurrentTime} of ${formattedDuration}`}
            aria-controls={context.mediaId}
            data-slider=""
            data-slot="media-player-seek"
            disabled={isDisabled}
            {...seekProps}
            ref={composedRef}
            min={seekableStart}
            max={seekableEnd}
            step={0.1}
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
              {bufferedRanges}
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
        </TooltipTrigger>
        {seekableEnd > 0 && (
          <TooltipContent
            ref={tooltipRef}
            side="top"
            align="start"
            alignOffset={tooltipPositionX}
            sideOffset={10}
            className="pointer-events-none border bg-accent text-accent-foreground dark:bg-zinc-900 [&>span]:hidden"
            role="tooltip"
          >
            {formattedHoverTime} / {formattedDuration}
          </TooltipContent>
        )}
      </Tooltip>
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
  },
);
MediaPlayerSeek.displayName = SEEK_NAME;

interface MediaPlayerVolumeProps
  extends React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> {
  asChild?: boolean;
  expandable?: boolean;
}

const MediaPlayerVolume = React.forwardRef<
  HTMLDivElement,
  MediaPlayerVolumeProps
>((props, forwardedRef) => {
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
        ref={forwardedRef}
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
});
MediaPlayerVolume.displayName = VOLUME_NAME;

interface MediaPlayerTimeProps extends React.ComponentPropsWithoutRef<"div"> {
  asChild?: boolean;
  mode?: "progress" | "remaining" | "duration";
}

const MediaPlayerTime = React.forwardRef<HTMLDivElement, MediaPlayerTimeProps>(
  (props, forwardedRef) => {
    const { asChild, className, mode = "progress", ...timeProps } = props;

    const context = useMediaPlayerContext(TIME_NAME);
    const mediaCurrentTime = useMediaSelector(
      (state) => state.mediaCurrentTime ?? 0,
    );
    const [, seekableEnd = 0] =
      useMediaSelector((state) => state.mediaSeekable) ?? [];

    const formattedCurrentTime = formatTime(mediaCurrentTime, seekableEnd);
    const formattedDuration = formatTime(seekableEnd, seekableEnd);
    const formattedRemainingTime = formatTime(
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
          ref={forwardedRef}
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
        ref={forwardedRef}
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
  },
);
MediaPlayerTime.displayName = TIME_NAME;

interface MediaPlayerPlaybackSpeedProps
  extends React.ComponentPropsWithoutRef<typeof SelectTrigger> {
  speeds?: number[];
}

const MediaPlayerPlaybackSpeed = React.forwardRef<
  React.ComponentRef<typeof SelectTrigger>,
  MediaPlayerPlaybackSpeedProps
>((props, forwardedRef) => {
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
          ref={forwardedRef}
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
});
MediaPlayerPlaybackSpeed.displayName = PLAYBACK_SPEED_NAME;

interface MediaPlayerLoopProps
  extends React.ComponentPropsWithoutRef<typeof Button> {}

const MediaPlayerLoop = React.forwardRef<
  HTMLButtonElement,
  MediaPlayerLoopProps
>((props, forwardedRef) => {
  const { asChild, children, className, ...loopProps } = props;

  const context = useMediaPlayerContext(LOOP_NAME);
  const [isLooping, setIsLooping] = React.useState(false);
  const isDisabled = props.disabled || context.disabled;

  // Get media element to check loop state
  React.useEffect(() => {
    const mediaElement = document.querySelector(
      `#${context.mediaId}`,
    ) as HTMLMediaElement | null;
    if (mediaElement) {
      setIsLooping(mediaElement.loop);
      const checkLoop = () => setIsLooping(mediaElement.loop);
      // Listen for attribute changes
      const observer = new MutationObserver(checkLoop);
      observer.observe(mediaElement, {
        attributes: true,
        attributeFilter: ["loop"],
      });
      return () => observer.disconnect();
    }
  }, [context.mediaId]);

  const onLoopToggle = React.useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      props.onClick?.(event);
      if (event.defaultPrevented) return;

      const mediaElement = document.querySelector(
        `#${context.mediaId}`,
      ) as HTMLMediaElement | null;
      if (mediaElement) {
        mediaElement.loop = !mediaElement.loop;
        setIsLooping(mediaElement.loop);
      }
    },
    [context.mediaId, props.onClick],
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
        ref={forwardedRef}
        variant="ghost"
        size="icon"
        className={cn("size-8", className)}
        onClick={onLoopToggle}
      >
        {children ?? (
          <RepeatIcon className={cn(!isLooping && "text-foreground/60")} />
        )}
      </Button>
    </MediaPlayerTooltip>
  );
});
MediaPlayerLoop.displayName = LOOP_NAME;

interface MediaPlayerFullscreenProps
  extends React.ComponentPropsWithoutRef<typeof Button> {}

const MediaPlayerFullscreen = React.forwardRef<
  HTMLButtonElement,
  MediaPlayerFullscreenProps
>((props, forwardedRef) => {
  const { asChild, children, className, disabled, ...fullscreenProps } = props;

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
        ref={forwardedRef}
        variant="ghost"
        size="icon"
        className={cn("size-8", className)}
        onClick={onFullscreen}
      >
        {children ?? (isFullscreen ? <Minimize2Icon /> : <Maximize2Icon />)}
      </Button>
    </MediaPlayerTooltip>
  );
});
MediaPlayerFullscreen.displayName = FULLSCREEN_NAME;

interface MediaPlayerPiPProps
  extends React.ComponentPropsWithoutRef<typeof Button> {
  onPipError?: (error: unknown, mode: "enter" | "exit") => void;
}

const MediaPlayerPiP = React.forwardRef<HTMLButtonElement, MediaPlayerPiPProps>(
  (props, forwardedRef) => {
    const {
      asChild,
      children,
      className,
      onPipError,
      disabled,
      ...pipButtonProps
    } = props;

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

        // Handle PiP errors through the media element directly
        const mediaElement = document.querySelector(
          `#${context.mediaId}`,
        ) as HTMLVideoElement | null;

        if (mediaElement) {
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
      [
        dispatch,
        props.onClick,
        isPictureInPicture,
        onPipError,
        context.mediaId,
      ],
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
          ref={forwardedRef}
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
  },
);
MediaPlayerPiP.displayName = PIP_NAME;

interface MediaPlayerCaptionsProps
  extends React.ComponentPropsWithoutRef<typeof Button> {}

const MediaPlayerCaptions = React.forwardRef<
  HTMLButtonElement,
  MediaPlayerCaptionsProps
>((props, forwardedRef) => {
  const { asChild, children, className, disabled, ...captionsProps } = props;

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
        ref={forwardedRef}
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
});
MediaPlayerCaptions.displayName = CAPTIONS_NAME;

interface MediaPlayerDownloadProps
  extends React.ComponentPropsWithoutRef<typeof Button> {}

const MediaPlayerDownload = React.forwardRef<
  HTMLButtonElement,
  MediaPlayerDownloadProps
>((props, forwardedRef) => {
  const { asChild, children, className, disabled, ...downloadProps } = props;

  const context = useMediaPlayerContext(DOWNLOAD_NAME);

  const isDisabled = disabled || context.disabled;

  const onDownload = React.useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      props.onClick?.(event);

      if (event.defaultPrevented) return;

      const mediaElement = document.querySelector(
        `#${context.mediaId}`,
      ) as HTMLMediaElement | null;

      if (!mediaElement || !mediaElement.currentSrc) return;

      const link = document.createElement("a");
      link.href = mediaElement.currentSrc;
      link.download = "";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },
    [context.mediaId, props.onClick],
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
        ref={forwardedRef}
        variant="ghost"
        size="icon"
        className={cn("size-8", className)}
        onClick={onDownload}
      >
        {children ?? <DownloadIcon />}
      </Button>
    </MediaPlayerTooltip>
  );
});
MediaPlayerDownload.displayName = DOWNLOAD_NAME;

interface MediaPlayerTooltipProps
  extends React.ComponentPropsWithoutRef<typeof Tooltip> {
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
  //
  MediaPlayerRoot as Root,
  MediaPlayerVideo as Video,
  MediaPlayerAudio as Audio,
  MediaPlayerControls as Controls,
  MediaPlayerOverlay as Overlay,
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
  //
  useMediaSelector as useMediaPlayer,
};
