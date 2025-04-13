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
import { useComposedRefs } from "@/lib/composition";
import { cn } from "@/lib/utils";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { Slot } from "@radix-ui/react-slot";
import {
  CaptionsOffIcon,
  DownloadIcon,
  Maximize2Icon,
  Minimize2Icon,
  PauseIcon,
  PictureInPicture2Icon,
  PictureInPictureIcon,
  PlayIcon,
  SubtitlesIcon,
  Volume1Icon,
  Volume2Icon,
  VolumeXIcon,
} from "lucide-react";
import * as React from "react";

const SEEK_THROTTLE_MS = 100;
const POINTER_MOVE_THROTTLE_MS = 16;

const ROOT_NAME = "MediaPlayer";
const CONTROLS_NAME = "MediaPlayerControls";
const PLAY_NAME = "MediaPlayerPlay";
const SEEK_NAME = "MediaPlayerSeek";
const VOLUME_NAME = "MediaPlayerVolume";
const TIME_NAME = "MediaPlayerTime";
const FULLSCREEN_NAME = "MediaPlayerFullscreen";
const VIDEO_NAME = "MediaPlayerVideo";
const AUDIO_NAME = "MediaPlayerAudio";
const PIP_NAME = "MediaPlayerPiP";
const PLAYBACK_SPEED_NAME = "MediaPlayerPlaybackSpeed";
const CAPTIONS_NAME = "MediaPlayerCaptions";
const DOWNLOAD_NAME = "MediaPlayerDownload";

const MEDIA_PLAYER_ERRORS = {
  [ROOT_NAME]: `\`${ROOT_NAME}\` must be used as root component`,
  [CONTROLS_NAME]: `\`${CONTROLS_NAME}\` must be within \`${ROOT_NAME}\``,
  [PLAY_NAME]: `\`${PLAY_NAME}\` must be within \`${ROOT_NAME}\``,
  [SEEK_NAME]: `\`${SEEK_NAME}\` must be within \`${ROOT_NAME}\``,
  [VOLUME_NAME]: `\`${VOLUME_NAME}\` must be within \`${ROOT_NAME}\``,
  [TIME_NAME]: `\`${TIME_NAME}\` must be within \`${ROOT_NAME}\``,
  [FULLSCREEN_NAME]: `\`${FULLSCREEN_NAME}\` must be within \`${ROOT_NAME}\``,
  [VIDEO_NAME]: `\`${VIDEO_NAME}\` must be within \`${ROOT_NAME}\``,
  [AUDIO_NAME]: `\`${AUDIO_NAME}\` must be within \`${ROOT_NAME}\``,
  [PIP_NAME]: `\`${PIP_NAME}\` must be within \`${ROOT_NAME}\``,
  [PLAYBACK_SPEED_NAME]: `\`${PLAYBACK_SPEED_NAME}\` must be within \`${ROOT_NAME}\``,
  [CAPTIONS_NAME]: `\`${CAPTIONS_NAME}\` must be within \`${ROOT_NAME}\``,
  [DOWNLOAD_NAME]: `\`${DOWNLOAD_NAME}\` must be within \`${ROOT_NAME}\``,
} as const;

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? React.useLayoutEffect : React.useEffect;

function useAsRef<T>(data: T) {
  const ref = React.useRef<T>(data);
  useIsomorphicLayoutEffect(() => {
    ref.current = data;
  });
  return ref;
}

function useLazyRef<T>(fn: () => T) {
  const ref = React.useRef<T | null>(null);
  if (ref.current === null) {
    ref.current = fn();
  }
  return ref as React.RefObject<T>;
}

type Direction = "ltr" | "rtl";

const DirectionContext = React.createContext<Direction | undefined>(undefined);

function useDirection(dirProp?: Direction): Direction {
  const contextDir = React.useContext(DirectionContext);
  return dirProp ?? contextDir ?? "ltr";
}

interface MediaState {
  isPlaying: boolean;
  isMuted: boolean;
  volume: number;
  currentTime: number;
  duration: number;
  buffered: TimeRanges | null;
  isFullscreen: boolean;
  isLooping: boolean;
  playbackRate: number;
  isPictureInPicture: boolean;
  captionsEnabled: boolean;
}

interface StoreState {
  media: MediaState;
}

type StoreAction =
  | { variant: "SET_PLAYING"; isPlaying: boolean }
  | { variant: "SET_MUTED"; isMuted: boolean }
  | { variant: "SET_VOLUME"; volume: number }
  | { variant: "SET_CURRENT_TIME"; currentTime: number }
  | { variant: "SET_DURATION"; duration: number }
  | { variant: "SET_BUFFERED"; buffered: TimeRanges }
  | { variant: "SET_FULLSCREEN"; isFullscreen: boolean }
  | { variant: "SET_LOOP"; isLooping: boolean }
  | { variant: "SET_PLAYBACK_RATE"; playbackRate: number }
  | { variant: "SET_PICTURE_IN_PICTURE"; isPictureInPicture: boolean }
  | { variant: "SET_CAPTIONS_ENABLED"; captionsEnabled: boolean };

function createStore(listeners: Set<() => void>, initialState: MediaState) {
  let state: StoreState = {
    media: initialState,
  };

  function getState() {
    return state;
  }

  function dispatch(action: StoreAction) {
    switch (action.variant) {
      case "SET_PLAYING":
        state = {
          ...state,
          media: { ...state.media, isPlaying: action.isPlaying },
        };
        break;

      case "SET_MUTED":
        state = {
          ...state,
          media: { ...state.media, isMuted: action.isMuted },
        };
        break;

      case "SET_VOLUME":
        state = {
          ...state,
          media: { ...state.media, volume: action.volume },
        };
        break;

      case "SET_CURRENT_TIME":
        state = {
          ...state,
          media: { ...state.media, currentTime: action.currentTime },
        };
        break;

      case "SET_DURATION":
        state = {
          ...state,
          media: { ...state.media, duration: action.duration },
        };
        break;

      case "SET_BUFFERED":
        state = {
          ...state,
          media: { ...state.media, buffered: action.buffered },
        };
        break;

      case "SET_FULLSCREEN":
        state = {
          ...state,
          media: { ...state.media, isFullscreen: action.isFullscreen },
        };
        break;

      case "SET_LOOP":
        state = {
          ...state,
          media: { ...state.media, isLooping: action.isLooping },
        };
        break;

      case "SET_PLAYBACK_RATE":
        state = {
          ...state,
          media: { ...state.media, playbackRate: action.playbackRate },
        };
        break;

      case "SET_PICTURE_IN_PICTURE":
        state = {
          ...state,
          media: {
            ...state.media,
            isPictureInPicture: action.isPictureInPicture,
          },
        };
        break;

      case "SET_CAPTIONS_ENABLED":
        state = {
          ...state,
          media: { ...state.media, captionsEnabled: action.captionsEnabled },
        };
        break;
    }

    for (const listener of listeners) {
      listener();
    }
  }

  function subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }

  return { getState, dispatch, subscribe };
}

const StoreContext = React.createContext<ReturnType<typeof createStore> | null>(
  null,
);
StoreContext.displayName = ROOT_NAME;

function useStoreContext(name: keyof typeof MEDIA_PLAYER_ERRORS) {
  const context = React.useContext(StoreContext);
  if (!context) {
    throw new Error(MEDIA_PLAYER_ERRORS[name]);
  }
  return context;
}

function useStore<T>(selector: (state: StoreState) => T): T {
  const store = useStoreContext(ROOT_NAME);

  const lastValueRef = useLazyRef<{ value: T; state: StoreState } | null>(
    () => null,
  );

  const getSnapshot = React.useCallback(() => {
    const state = store.getState();
    const prevValue = lastValueRef.current;

    if (prevValue && prevValue.state === state) {
      return prevValue.value;
    }

    const nextValue = selector(state);
    lastValueRef.current = { value: nextValue, state };
    return nextValue;
  }, [store, selector, lastValueRef]);

  return React.useSyncExternalStore(store.subscribe, getSnapshot, getSnapshot);
}

interface MediaPlayerContextValue {
  id: string;
  mediaRef: React.RefObject<HTMLVideoElement | HTMLAudioElement | null>;
  dir: Direction;
  disabled: boolean;
}

const MediaPlayerContext = React.createContext<MediaPlayerContextValue | null>(
  null,
);

function useMediaPlayerContext(name: keyof typeof MEDIA_PLAYER_ERRORS) {
  const context = React.useContext(MediaPlayerContext);
  if (!context) {
    throw new Error(MEDIA_PLAYER_ERRORS[name]);
  }
  return context;
}

interface MediaPlayerRootProps
  extends Omit<
    React.ComponentPropsWithoutRef<"div">,
    "onTimeUpdate" | "onVolumeChange"
  > {
  asChild?: boolean;
  disabled?: boolean;
  dir?: Direction;
  defaultVolume?: number;
  defaultMuted?: boolean;
  defaultPlaying?: boolean;
  defaultLoop?: boolean;
  onPlay?: () => void;
  onPause?: () => void;
  onEnded?: () => void;
  onTimeUpdate?: (time: number) => void;
  onVolumeChange?: (volume: number) => void;
  onMuted?: (muted: boolean) => void;
}

const MediaPlayerRoot = React.forwardRef<HTMLDivElement, MediaPlayerRootProps>(
  (props, forwardedRef) => {
    const {
      asChild,
      disabled = false,
      dir: dirProp,
      defaultVolume = 1,
      defaultMuted = false,
      defaultPlaying = false,
      defaultLoop = false,
      onPlay,
      onPause,
      onEnded,
      onTimeUpdate,
      onVolumeChange,
      onMuted,
      children,
      className,
      ...rootProps
    } = props;

    const id = React.useId();

    const dir = useDirection(dirProp);
    const mediaRef = React.useRef<HTMLVideoElement | HTMLAudioElement>(null);
    const propsRef = useAsRef(props);
    const listeners = useLazyRef(() => new Set<() => void>()).current;

    const initialState = React.useMemo<MediaState>(
      () => ({
        isPlaying: defaultPlaying,
        isMuted: defaultMuted,
        volume: defaultVolume,
        currentTime: 0,
        duration: 0,
        buffered: null,
        isFullscreen: false,
        isLooping: defaultLoop,
        playbackRate: 1,
        isPictureInPicture: false,
        captionsEnabled: false,
      }),
      [defaultPlaying, defaultMuted, defaultVolume, defaultLoop],
    );

    const store = React.useMemo(
      () => createStore(listeners, initialState),
      [listeners, initialState],
    );

    const contextValue = React.useMemo<MediaPlayerContextValue>(
      () => ({
        id,
        mediaRef,
        dir,
        disabled,
      }),
      [id, dir, disabled],
    );

    React.useEffect(() => {
      const media = mediaRef.current;
      if (!media) return;

      const onTimeUpdate = () => {
        store.dispatch({
          variant: "SET_CURRENT_TIME",
          currentTime: media.currentTime,
        });
        propsRef.current.onTimeUpdate?.(media.currentTime);
      };

      const onDurationChange = () => {
        store.dispatch({
          variant: "SET_DURATION",
          duration: media.duration,
        });
        store.dispatch({
          variant: "SET_BUFFERED",
          buffered: media.buffered,
        });
      };

      const onProgress = () => {
        store.dispatch({
          variant: "SET_BUFFERED",
          buffered: media.buffered,
        });
      };

      const onSeeked = () => {
        store.dispatch({
          variant: "SET_BUFFERED",
          buffered: media.buffered,
        });
      };

      const onPlay = () => {
        store.dispatch({ variant: "SET_PLAYING", isPlaying: true });
        propsRef.current.onPlay?.();
      };

      const onPause = () => {
        store.dispatch({ variant: "SET_PLAYING", isPlaying: false });
        propsRef.current.onPause?.();
      };

      const onEnded = () => {
        store.dispatch({ variant: "SET_PLAYING", isPlaying: false });
        propsRef.current.onEnded?.();
      };

      const onVolumeChange = () => {
        store.dispatch({ variant: "SET_VOLUME", volume: media.volume });
        store.dispatch({ variant: "SET_MUTED", isMuted: media.muted });
        propsRef.current.onVolumeChange?.(media.volume);
        propsRef.current.onMuted?.(media.muted);
      };

      const onFullscreenChange = () => {
        store.dispatch({
          variant: "SET_FULLSCREEN",
          isFullscreen: !!document.fullscreenElement,
        });
      };

      const onEnteredPiP = () => {
        store.dispatch({
          variant: "SET_PICTURE_IN_PICTURE",
          isPictureInPicture: true,
        });
      };

      const onExitedPiP = () => {
        store.dispatch({
          variant: "SET_PICTURE_IN_PICTURE",
          isPictureInPicture: false,
        });
      };

      const onRateChange = () => {
        store.dispatch({
          variant: "SET_PLAYBACK_RATE",
          playbackRate: media.playbackRate,
        });
      };

      media.addEventListener("timeupdate", onTimeUpdate);
      media.addEventListener("durationchange", onDurationChange);
      media.addEventListener("progress", onProgress);
      media.addEventListener("play", onPlay);
      media.addEventListener("pause", onPause);
      media.addEventListener("ended", onEnded);
      media.addEventListener("volumechange", onVolumeChange);
      media.addEventListener("ratechange", onRateChange);
      media.addEventListener("seeked", onSeeked);
      document.addEventListener("fullscreenchange", onFullscreenChange);

      if (media instanceof HTMLVideoElement) {
        media.addEventListener("enterpictureinpicture", onEnteredPiP);
        media.addEventListener("leavepictureinpicture", onExitedPiP);
      }

      return () => {
        media.removeEventListener("timeupdate", onTimeUpdate);
        media.removeEventListener("durationchange", onDurationChange);
        media.removeEventListener("progress", onProgress);
        media.removeEventListener("play", onPlay);
        media.removeEventListener("pause", onPause);
        media.removeEventListener("ended", onEnded);
        media.removeEventListener("volumechange", onVolumeChange);
        media.removeEventListener("ratechange", onRateChange);
        media.removeEventListener("seeked", onSeeked);
        document.removeEventListener("fullscreenchange", onFullscreenChange);

        if (media instanceof HTMLVideoElement) {
          media.removeEventListener("enterpictureinpicture", onEnteredPiP);
          media.removeEventListener("leavepictureinpicture", onExitedPiP);
        }
      };
    }, [
      store,
      propsRef.current.onTimeUpdate,
      propsRef.current.onVolumeChange,
      propsRef.current.onMuted,
      propsRef.current.onPlay,
      propsRef.current.onPause,
      propsRef.current.onEnded,
    ]);

    const RootPrimitive = asChild ? Slot : "div";

    return (
      <StoreContext.Provider value={store}>
        <MediaPlayerContext.Provider value={contextValue}>
          <RootPrimitive
            data-disabled={disabled ? "" : undefined}
            data-slot="media-player"
            dir={dir}
            {...rootProps}
            ref={forwardedRef}
            className={cn(
              "relative flex flex-col overflow-hidden rounded-lg bg-background",
              "[:fullscreen_&]:flex [:fullscreen_&]:h-full [:fullscreen_&]:max-h-screen [:fullscreen_&]:flex-col [:fullscreen_&]:justify-between",
              "[&_[data-slider]::before]:-top-6 [&_[data-slider]::before]:-bottom-2 [&_[data-slider]::before]:absolute [&_[data-slider]::before]:inset-x-0 [&_[data-slider]::before]:z-10 [&_[data-slider]::before]:h-12 [&_[data-slider]::before]:cursor-pointer [&_[data-slider]::before]:content-[''] [&_[data-slider]]:relative",
              className,
            )}
          >
            {children}
          </RootPrimitive>
        </MediaPlayerContext.Provider>
      </StoreContext.Provider>
    );
  },
);
MediaPlayerRoot.displayName = ROOT_NAME;

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
  const isFullscreen = useStore((state) => state.media.isFullscreen);

  const ControlsPrimitive = asChild ? Slot : "div";

  return (
    <ControlsPrimitive
      data-slot="media-player-controls"
      data-state={isFullscreen ? "fullscreen" : "windowed"}
      dir={context.dir}
      {...controlsProps}
      ref={forwardedRef}
      className={cn(
        "absolute right-0 bottom-0 left-0 flex items-center gap-2 bg-gradient-to-t from-background/80 to-transparent p-2",
        "[:fullscreen_&]:absolute [:fullscreen_&]:right-0 [:fullscreen_&]:bottom-0 [:fullscreen_&]:left-0 [:fullscreen_&]:z-50 [:fullscreen_&]:bg-gradient-to-t [:fullscreen_&]:from-black/80 [:fullscreen_&]:to-transparent [:fullscreen_&]:p-4",
        "data-[state=fullscreen]:absolute data-[state=fullscreen]:right-0 data-[state=fullscreen]:bottom-0 data-[state=fullscreen]:left-0 data-[state=fullscreen]:z-50 data-[state=fullscreen]:bg-gradient-to-t data-[state=fullscreen]:from-black/80 data-[state=fullscreen]:to-transparent data-[state=fullscreen]:p-4",
        className,
      )}
    />
  );
});
MediaPlayerControls.displayName = CONTROLS_NAME;

interface MediaPlayerPlayProps
  extends React.ComponentPropsWithoutRef<typeof Button> {}

const MediaPlayerPlay = React.forwardRef<
  HTMLButtonElement,
  MediaPlayerPlayProps
>((props, forwardedRef) => {
  const { asChild, children, className, ...playButtonProps } = props;

  const context = useMediaPlayerContext(PLAY_NAME);
  const isPlaying = useStore((state) => state.media.isPlaying);

  const onPlay = React.useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      props.onClick?.(event);

      if (event.defaultPrevented) return;

      const media = context.mediaRef.current;
      if (!media) return;

      media.play();
    },
    [context.mediaRef, props.onClick],
  );

  const onPause = React.useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      props.onClick?.(event);

      if (event.defaultPrevented) return;

      const media = context.mediaRef.current;
      if (!media) return;

      media.pause();
    },
    [context.mediaRef, props.onClick],
  );

  return (
    <Button
      type="button"
      aria-label={isPlaying ? "Pause" : "Play"}
      data-state={isPlaying ? "playing" : "paused"}
      data-slot="media-player-play-button"
      {...playButtonProps}
      ref={forwardedRef}
      variant="ghost"
      size="icon"
      className={cn("size-8", className)}
      onClick={isPlaying ? onPause : onPlay}
    >
      {children ??
        (isPlaying ? (
          <PauseIcon className="fill-current" />
        ) : (
          <PlayIcon className="fill-current" />
        ))}
    </Button>
  );
});
MediaPlayerPlay.displayName = PLAY_NAME;

interface MediaPlayerSeekProps
  extends React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> {
  withTime?: boolean;
}

const MediaPlayerSeek = React.forwardRef<HTMLDivElement, MediaPlayerSeekProps>(
  (props, forwardedRef) => {
    const { asChild, className, withTime = false, ...seekProps } = props;

    const context = useMediaPlayerContext(SEEK_NAME);
    const store = useStoreContext(SEEK_NAME);
    const currentTime = useStore((state) => state.media.currentTime);
    const duration = useStore((state) => state.media.duration);
    const buffered = useStore((state) => state.media.buffered);

    const seekRef = React.useRef<HTMLDivElement>(null);
    const tooltipRef = React.useRef<HTMLDivElement>(null);
    const composedRef = useComposedRefs(forwardedRef, seekRef);

    const [tooltipPositionX, setTooltipPositionX] = React.useState(0);
    const [isHoveringSeek, setIsHoveringSeek] = React.useState(false);
    const [hoverTime, setHoverTime] = React.useState(0);

    const pointerMoveThrottleTimeoutRef = React.useRef<NodeJS.Timeout | null>(
      null,
    );

    const seekThrottleTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
    const latestSeekValueRef = React.useRef<number | null>(null);

    const onPointerEnter = React.useCallback(() => {
      if (duration > 0) {
        setIsHoveringSeek(true);
      }
    }, [duration]);

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
          duration <= 0 ||
          pointerMoveThrottleTimeoutRef.current
        ) {
          return;
        }

        const rect = seekRef.current.getBoundingClientRect();
        const offsetX = event.clientX - rect.left;
        const clampedOffsetX = Math.max(0, Math.min(offsetX, rect.width));
        const relativeX = clampedOffsetX / rect.width;
        const calculatedHoverTime = relativeX * duration;

        const tooltipWidth =
          tooltipRef.current?.getBoundingClientRect().width ?? 0;
        const centeredPosition = clampedOffsetX - tooltipWidth / 2;

        setTooltipPositionX(centeredPosition);
        setHoverTime(calculatedHoverTime);

        pointerMoveThrottleTimeoutRef.current = setTimeout(() => {
          pointerMoveThrottleTimeoutRef.current = null;
        }, POINTER_MOVE_THROTTLE_MS);
      },
      [duration],
    );

    const onSeek = React.useCallback(
      (value: number[]) => {
        const media = context.mediaRef.current;
        if (!media) return;

        const time = value[0] ?? 0;
        media.currentTime = time;
        latestSeekValueRef.current = time;

        if (!seekThrottleTimeoutRef.current) {
          store.dispatch({ variant: "SET_CURRENT_TIME", currentTime: time });

          seekThrottleTimeoutRef.current = setTimeout(() => {
            seekThrottleTimeoutRef.current = null;
            if (
              latestSeekValueRef.current !== null &&
              latestSeekValueRef.current !== time
            ) {
              store.dispatch({
                variant: "SET_CURRENT_TIME",
                currentTime: latestSeekValueRef.current,
              });
            }
          }, SEEK_THROTTLE_MS);
        }
      },
      [context.mediaRef, store],
    );

    const onSeekCommit = React.useCallback(
      (value: number[]) => {
        const media = context.mediaRef.current;
        if (!media) return;

        const time = value[0] ?? 0;
        if (seekThrottleTimeoutRef.current) {
          clearTimeout(seekThrottleTimeoutRef.current);
          seekThrottleTimeoutRef.current = null;
        }
        store.dispatch({ variant: "SET_CURRENT_TIME", currentTime: time });
        latestSeekValueRef.current = null;
      },
      [context.mediaRef, store],
    );

    const bufferedRanges = React.useMemo(() => {
      if (!buffered || duration <= 0) return null;

      return Array.from({ length: buffered.length }).map((_, i) => {
        const start = buffered.start(i);
        const end = buffered.end(i);
        const startPercent = (start / duration) * 100;
        const widthPercent = ((end - start) / duration) * 100;

        return (
          <div
            key={i}
            className="absolute h-full bg-secondary-foreground/50"
            style={{
              left: `${startPercent}%`,
              width: `${widthPercent}%`,
            }}
          />
        );
      });
    }, [buffered, duration]);

    const SeekSlider = (
      <Tooltip delayDuration={150} open={isHoveringSeek}>
        <TooltipTrigger asChild>
          <SliderPrimitive.Root
            aria-label="Seek"
            data-slider=""
            data-slot="media-player-seek"
            {...seekProps}
            ref={composedRef}
            min={0}
            max={duration}
            step={0.1}
            value={[currentTime]}
            onValueChange={onSeek}
            onValueCommit={onSeekCommit}
            onPointerMove={onPointerMove}
            className={cn(
              "relative flex w-full touch-none select-none items-center",
              className,
            )}
          >
            <SliderPrimitive.Track className="relative h-1 w-full grow overflow-hidden rounded-full bg-secondary">
              {bufferedRanges}
              <SliderPrimitive.Range className="absolute h-full bg-primary" />
            </SliderPrimitive.Track>
            <SliderPrimitive.Thumb
              aria-valuetext={`${currentTime} of ${duration}`}
              className="relative z-10 block size-2.5 shrink-0 rounded-full bg-primary shadow-sm ring-ring/50 transition-[color,box-shadow] hover:ring-4 focus-visible:outline-hidden focus-visible:ring-4 disabled:pointer-events-none disabled:opacity-50"
            />
          </SliderPrimitive.Root>
        </TooltipTrigger>
        {duration > 0 && (
          <TooltipContent
            ref={tooltipRef}
            side="top"
            align="start"
            alignOffset={tooltipPositionX}
            sideOffset={10}
            className="pointer-events-none bg-accent text-accent-foreground [&>span]:hidden"
          >
            {formatTime(hoverTime)} / {formatTime(duration)}
          </TooltipContent>
        )}
      </Tooltip>
    );

    const SeekWrapper = (
      <div
        data-slot="media-player-seek-wrapper"
        className="relative w-full"
        onPointerEnter={onPointerEnter}
        onPointerLeave={onPointerLeave}
      >
        {SeekSlider}
      </div>
    );

    if (withTime) {
      return (
        <div className="flex w-full items-center gap-2">
          <span className="text-sm">{formatTime(currentTime)}</span>
          <div className={cn("w-full", className)}>{SeekWrapper}</div>
          <span className="text-sm">{formatTime(duration - currentTime)}</span>
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
}

const MediaPlayerVolume = React.forwardRef<
  HTMLDivElement,
  MediaPlayerVolumeProps
>((props, forwardedRef) => {
  const { asChild, className, ...volumeProps } = props;

  const context = useMediaPlayerContext(VOLUME_NAME);
  const store = useStoreContext(VOLUME_NAME);
  const volume = useStore((state) => state.media.volume);
  const isMuted = useStore((state) => state.media.isMuted);
  const previousVolumeRef = React.useRef(volume ?? 1);

  const onVolumeChange = React.useCallback(
    (value: number[]) => {
      const media = context.mediaRef.current;
      if (!media) return;

      const volume = value[0] ?? 0;
      media.volume = volume;
      media.muted = volume === 0;
      previousVolumeRef.current = volume;
      store.dispatch({ variant: "SET_VOLUME", volume });
      store.dispatch({ variant: "SET_MUTED", isMuted: volume === 0 });
    },
    [context.mediaRef, store],
  );

  const onMute = React.useCallback(() => {
    const media = context.mediaRef.current;
    if (!media) return;

    if (!isMuted) {
      previousVolumeRef.current = volume ?? previousVolumeRef.current;
      media.volume = 0;
      media.muted = true;
      store.dispatch({ variant: "SET_VOLUME", volume: 0 });
      store.dispatch({ variant: "SET_MUTED", isMuted: true });
    } else {
      const restoreVolume = previousVolumeRef.current;
      media.volume = restoreVolume;
      media.muted = false;
      store.dispatch({ variant: "SET_VOLUME", volume: restoreVolume });
      store.dispatch({ variant: "SET_MUTED", isMuted: false });
    }
  }, [context.mediaRef, store, volume, isMuted]);

  return (
    <div className="flex items-center gap-2">
      <Button
        type="button"
        aria-label={isMuted ? "Unmute" : "Mute"}
        data-state={isMuted ? "muted" : "unmuted"}
        data-slot="media-player-mute"
        variant="ghost"
        size="icon"
        className="size-8"
        onClick={onMute}
      >
        {isMuted ? (
          <VolumeXIcon />
        ) : (volume ?? 0) > 0.5 ? (
          <Volume2Icon />
        ) : (
          <Volume1Icon />
        )}
      </Button>
      <SliderPrimitive.Root
        aria-label="Volume"
        data-slider=""
        data-slot="media-player-volume"
        {...volumeProps}
        ref={forwardedRef}
        min={0}
        max={1}
        step={0.1}
        value={[volume ?? 0]}
        onValueChange={onVolumeChange}
        className={cn(
          "relative flex w-16 touch-none select-none items-center",
          className,
        )}
      >
        <SliderPrimitive.Track className="relative h-1 w-full grow overflow-hidden rounded-full bg-secondary">
          <SliderPrimitive.Range className="absolute h-full bg-primary" />
        </SliderPrimitive.Track>
        <SliderPrimitive.Thumb
          aria-valuetext={`${volume * 100}% volume`}
          className="block size-2.5 shrink-0 rounded-full bg-primary shadow-sm ring-ring/50 transition-[color,box-shadow] hover:ring-4 focus-visible:outline-hidden focus-visible:ring-4 disabled:pointer-events-none disabled:opacity-50"
        />
      </SliderPrimitive.Root>
    </div>
  );
});
MediaPlayerVolume.displayName = VOLUME_NAME;

function formatTime(time: number) {
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

interface MediaPlayerTimeProps extends React.ComponentPropsWithoutRef<"div"> {
  asChild?: boolean;
}

const MediaPlayerTime = React.forwardRef<HTMLDivElement, MediaPlayerTimeProps>(
  (props, forwardedRef) => {
    const { asChild, className, ...timeProps } = props;

    const context = useMediaPlayerContext(TIME_NAME);
    const currentTime = useStore((state) => state.media.currentTime);
    const duration = useStore((state) => state.media.duration);

    const TimePrimitive = asChild ? Slot : "div";

    return (
      <TimePrimitive
        data-slot="media-player-time"
        dir={context.dir}
        {...timeProps}
        ref={forwardedRef}
        className={cn("text-sm", className)}
      >
        <span>{formatTime(currentTime)}</span>
        <span className="mx-1">/</span>
        <span>{formatTime(duration ?? 0)}</span>
      </TimePrimitive>
    );
  },
);
MediaPlayerTime.displayName = TIME_NAME;

interface MediaPlayerFullscreenProps
  extends React.ComponentPropsWithoutRef<typeof Button> {}

const MediaPlayerFullscreen = React.forwardRef<
  HTMLButtonElement,
  MediaPlayerFullscreenProps
>((props, forwardedRef) => {
  const { asChild, children, className, ...fullscreenProps } = props;

  const context = useMediaPlayerContext(FULLSCREEN_NAME);
  const store = useStoreContext(FULLSCREEN_NAME);
  const isFullscreen = useStore((state) => state.media.isFullscreen);

  const onFullscreen = React.useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      props.onClick?.(event);

      if (event.defaultPrevented) return;

      const media = context.mediaRef.current;
      if (!media) return;

      if (!document.fullscreenElement) {
        const container = media.closest('[data-slot="media-player"]');
        console.log({ container });
        if (container) {
          container.requestFullscreen();
        } else {
          media.requestFullscreen();
        }
        store.dispatch({ variant: "SET_FULLSCREEN", isFullscreen: true });
      } else {
        document.exitFullscreen();
        store.dispatch({ variant: "SET_FULLSCREEN", isFullscreen: false });
      }
    },
    [context.mediaRef, props.onClick, store],
  );

  return (
    <Button
      type="button"
      aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
      data-state={isFullscreen ? "fullscreen" : "windowed"}
      data-slot="media-player-fullscreen"
      {...fullscreenProps}
      ref={forwardedRef}
      variant="ghost"
      size="icon"
      className={cn("size-8", className)}
      onClick={onFullscreen}
    >
      {children ?? (isFullscreen ? <Minimize2Icon /> : <Maximize2Icon />)}
    </Button>
  );
});
MediaPlayerFullscreen.displayName = FULLSCREEN_NAME;

interface MediaPlayerPiPProps
  extends React.ComponentPropsWithoutRef<typeof Button> {}

const MediaPlayerPiP = React.forwardRef<HTMLButtonElement, MediaPlayerPiPProps>(
  (props, forwardedRef) => {
    const { asChild, children, className, ...pipButtonProps } = props;

    const context = useMediaPlayerContext(PIP_NAME);
    const isPictureInPicture = useStore(
      (state) => state.media.isPictureInPicture,
    );

    const onPictureInPicture = React.useCallback(() => {
      const media = context.mediaRef.current;
      if (!media || !(media instanceof HTMLVideoElement)) return;

      if (document.pictureInPictureElement === media) {
        document.exitPictureInPicture().catch((error) => {
          console.error("Failed to exit Picture-in-Picture mode:", error);
        });
      } else {
        media.requestPictureInPicture().catch((error) => {
          console.error("Failed to enter Picture-in-Picture mode:", error);
        });
      }
    }, [context.mediaRef]);

    return (
      <Button
        type="button"
        aria-label={isPictureInPicture ? "Exit pip" : "Enter pip"}
        data-state={isPictureInPicture ? "pip" : "inline"}
        data-slot="media-player-pip"
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
    );
  },
);
MediaPlayerPiP.displayName = PIP_NAME;

interface MediaPlayerVideoProps
  extends React.ComponentPropsWithoutRef<"video"> {
  asChild?: boolean;
}

const MediaPlayerVideo = React.forwardRef<
  HTMLVideoElement,
  MediaPlayerVideoProps
>((props, forwardedRef) => {
  const { asChild, className, controls = false, ...videoProps } = props;

  const context = useMediaPlayerContext(VIDEO_NAME);
  const isLooping = useStore((state) => state.media.isLooping);
  const composedRef = useComposedRefs(forwardedRef, context.mediaRef);

  const VideoPrimitive = asChild ? Slot : "video";

  return (
    <VideoPrimitive
      ref={composedRef}
      loop={isLooping}
      playsInline
      preload="metadata"
      data-slot="media-player-video"
      controlsList="nodownload noremoteplayback"
      controls={controls}
      {...videoProps}
      className={cn("h-full w-full", className)}
    />
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
  const { asChild, className, ...audioProps } = props;

  const context = useMediaPlayerContext(AUDIO_NAME);
  const isLooping = useStore((state) => state.media.isLooping);
  const composedRef = useComposedRefs(forwardedRef, context.mediaRef);

  const AudioPrimitive = asChild ? Slot : "audio";

  return (
    <AudioPrimitive
      ref={composedRef}
      loop={isLooping}
      preload="metadata"
      data-slot="media-player-audio"
      {...audioProps}
      className={cn("w-full", className)}
    />
  );
});
MediaPlayerAudio.displayName = AUDIO_NAME;

interface MediaPlayerPlaybackSpeedProps
  extends React.ComponentPropsWithoutRef<"div"> {
  asChild?: boolean;
  speeds?: number[];
}

const MediaPlayerPlaybackSpeed = React.forwardRef<
  HTMLDivElement,
  MediaPlayerPlaybackSpeedProps
>((props, forwardedRef) => {
  const {
    asChild,
    speeds = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2],
    className,
    ...playbackSpeedProps
  } = props;

  const context = useMediaPlayerContext(PLAYBACK_SPEED_NAME);
  const store = useStoreContext(PLAYBACK_SPEED_NAME);
  const playbackRate = useStore((state) => state.media.playbackRate);

  const onPlaybackRateChange = React.useCallback(
    (value: string) => {
      const media = context.mediaRef.current;
      if (!media) return;

      const rate = Number.parseFloat(value);
      media.playbackRate = rate;
      store.dispatch({ variant: "SET_PLAYBACK_RATE", playbackRate: rate });
    },
    [context.mediaRef, store],
  );

  const PlaybackSpeedPrimitive = asChild ? Slot : "div";

  return (
    <PlaybackSpeedPrimitive
      data-slot="media-player-playback-speed"
      dir={context.dir}
      {...playbackSpeedProps}
      ref={forwardedRef}
      className={cn("flex items-center gap-1.5", className)}
    >
      <Select
        value={playbackRate.toString()}
        onValueChange={onPlaybackRateChange}
      >
        <SelectTrigger className="h-8 w-16 justify-center border-none data-[state=open]:bg-accent data-[state=closed]:hover:bg-accent data-[state=closed]:dark:bg-transparent data-[state=closed]:dark:hover:bg-accent/50 [&[data-size]]:h-8 [&_svg]:hidden">
          <SelectValue>{playbackRate}x</SelectValue>
        </SelectTrigger>
        <SelectContent className="min-w-[var(--radix-select-trigger-width)]">
          {speeds.map((speed) => (
            <SelectItem key={speed} value={speed.toString()}>
              {speed}x
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </PlaybackSpeedPrimitive>
  );
});
MediaPlayerPlaybackSpeed.displayName = PLAYBACK_SPEED_NAME;

interface MediaPlayerCaptionsProps
  extends React.ComponentPropsWithoutRef<typeof Button> {}

const MediaPlayerCaptions = React.forwardRef<
  HTMLButtonElement,
  MediaPlayerCaptionsProps
>((props, forwardedRef) => {
  const { asChild, children, className, ...captionsProps } = props;

  const context = useMediaPlayerContext(CAPTIONS_NAME);
  const store = useStoreContext(CAPTIONS_NAME);
  const captionsEnabled = useStore((state) => state.media.captionsEnabled);

  const onToggleCaptions = React.useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      props.onClick?.(event);

      if (event.defaultPrevented) return;
      const media = context.mediaRef.current;
      if (!media) return;

      // Toggle captions - this assumes you're using the tracks API
      if (media instanceof HTMLVideoElement && media.textTracks.length > 0) {
        for (let i = 0; i < media.textTracks.length; i++) {
          const track = media.textTracks[i];
          // Only toggle if it's a caption or subtitle track
          if (
            track &&
            (track.kind === "captions" || track.kind === "subtitles")
          ) {
            track.mode = captionsEnabled ? "hidden" : "showing";
          }
        }
      }

      store.dispatch({
        variant: "SET_CAPTIONS_ENABLED",
        captionsEnabled: !captionsEnabled,
      });
    },
    [context.mediaRef, props.onClick, store, captionsEnabled],
  );

  return (
    <Button
      type="button"
      aria-label={captionsEnabled ? "Disable captions" : "Enable captions"}
      data-state={captionsEnabled ? "active" : "inactive"}
      data-slot="media-player-captions"
      {...captionsProps}
      ref={forwardedRef}
      variant="ghost"
      size="icon"
      className={cn("size-8", className)}
      onClick={onToggleCaptions}
    >
      {children ?? (captionsEnabled ? <SubtitlesIcon /> : <CaptionsOffIcon />)}
    </Button>
  );
});
MediaPlayerCaptions.displayName = CAPTIONS_NAME;

interface MediaPlayerDownloadProps
  extends React.ComponentPropsWithoutRef<typeof Button> {}

const MediaPlayerDownload = React.forwardRef<
  HTMLButtonElement,
  MediaPlayerDownloadProps
>((props, forwardedRef) => {
  const { asChild, children, className, ...downloadProps } = props;

  const context = useMediaPlayerContext(DOWNLOAD_NAME);
  const mediaUrl = context.mediaRef.current?.currentSrc;

  const onDownload = React.useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      props.onClick?.(event);

      if (event.defaultPrevented) return;

      const media = context.mediaRef.current;
      if (!media || !mediaUrl) return;

      const link = document.createElement("a");
      link.href = mediaUrl;
      link.download = "";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },
    [context.mediaRef, mediaUrl, props.onClick],
  );

  return (
    <Button
      type="button"
      aria-label="Download"
      data-slot="media-player-download"
      {...downloadProps}
      ref={forwardedRef}
      variant="ghost"
      size="icon"
      className={cn("size-8", className)}
      onClick={onDownload}
    >
      {children ?? <DownloadIcon />}
    </Button>
  );
});
MediaPlayerDownload.displayName = DOWNLOAD_NAME;

const MediaPlayer = MediaPlayerRoot;
const Root = MediaPlayerRoot;
const Controls = MediaPlayerControls;
const Play = MediaPlayerPlay;
const Seek = MediaPlayerSeek;
const Volume = MediaPlayerVolume;
const Time = MediaPlayerTime;
const Fullscreen = MediaPlayerFullscreen;
const PiP = MediaPlayerPiP;
const Video = MediaPlayerVideo;
const Audio = MediaPlayerAudio;
const PlaybackSpeed = MediaPlayerPlaybackSpeed;
const Captions = MediaPlayerCaptions;
const Download = MediaPlayerDownload;

export {
  MediaPlayer,
  MediaPlayerControls,
  MediaPlayerPlay,
  MediaPlayerSeek,
  MediaPlayerVolume,
  MediaPlayerTime,
  MediaPlayerFullscreen,
  MediaPlayerPiP,
  MediaPlayerVideo,
  MediaPlayerAudio,
  MediaPlayerPlaybackSpeed,
  MediaPlayerCaptions,
  MediaPlayerDownload,
  //
  Root,
  Controls,
  Play,
  Seek,
  Volume,
  Time,
  Fullscreen,
  PiP,
  Video,
  Audio,
  PlaybackSpeed,
  Captions,
  Download,
  //
  useStore as useMediaPlayer,
};
