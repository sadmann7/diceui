"use client";

import { cn } from "@/lib/utils";
import { Slot } from "@radix-ui/react-slot";
import {
  FullscreenIcon,
  MinimizeIcon,
  PauseIcon,
  PlayIcon,
  RepeatIcon,
  ShuffleIcon,
  SkipBackIcon,
  SkipForwardIcon,
  Volume2Icon,
  VolumeIcon,
  VolumeXIcon,
} from "lucide-react";
import * as React from "react";

const ROOT_NAME = "MediaPlayer";
const CONTROLS_NAME = "MediaPlayerControls";
const PLAY_BUTTON_NAME = "MediaPlayerPlayButton";
const SEEK_NAME = "MediaPlayerSeek";
const VOLUME_NAME = "MediaPlayerVolume";
const TIME_NAME = "MediaPlayerTime";
const FULLSCREEN_NAME = "MediaPlayerFullscreen";
const VIDEO_NAME = "MediaPlayerVideo";
const AUDIO_NAME = "MediaPlayerAudio";

const MEDIA_PLAYER_ERRORS = {
  [ROOT_NAME]: `\`${ROOT_NAME}\` must be used as root component`,
  [CONTROLS_NAME]: `\`${CONTROLS_NAME}\` must be within \`${ROOT_NAME}\``,
  [PLAY_BUTTON_NAME]: `\`${PLAY_BUTTON_NAME}\` must be within \`${ROOT_NAME}\``,
  [SEEK_NAME]: `\`${SEEK_NAME}\` must be within \`${ROOT_NAME}\``,
  [VOLUME_NAME]: `\`${VOLUME_NAME}\` must be within \`${ROOT_NAME}\``,
  [TIME_NAME]: `\`${TIME_NAME}\` must be within \`${ROOT_NAME}\``,
  [FULLSCREEN_NAME]: `\`${FULLSCREEN_NAME}\` must be within \`${ROOT_NAME}\``,
  [VIDEO_NAME]: `\`${VIDEO_NAME}\` must be within \`${ROOT_NAME}\``,
  [AUDIO_NAME]: `\`${AUDIO_NAME}\` must be within \`${ROOT_NAME}\``,
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
  | { variant: "SET_PLAYBACK_RATE"; playbackRate: number };

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
      };

      const onProgress = () => {
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

      media.addEventListener("timeupdate", onTimeUpdate);
      media.addEventListener("durationchange", onDurationChange);
      media.addEventListener("progress", onProgress);
      media.addEventListener("play", onPlay);
      media.addEventListener("pause", onPause);
      media.addEventListener("ended", onEnded);
      media.addEventListener("volumechange", onVolumeChange);
      document.addEventListener("fullscreenchange", onFullscreenChange);

      return () => {
        media.removeEventListener("timeupdate", onTimeUpdate);
        media.removeEventListener("durationchange", onDurationChange);
        media.removeEventListener("progress", onProgress);
        media.removeEventListener("play", onPlay);
        media.removeEventListener("pause", onPause);
        media.removeEventListener("ended", onEnded);
        media.removeEventListener("volumechange", onVolumeChange);
        document.removeEventListener("fullscreenchange", onFullscreenChange);
      };
    }, [store, propsRef]);

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
      dir={context.dir}
      {...controlsProps}
      ref={forwardedRef}
      className={cn(
        "relative flex items-center gap-2 bg-gradient-to-t from-background/80 to-transparent p-2",
        "[:fullscreen_&]:z-50 [:fullscreen_&]:bg-gradient-to-t [:fullscreen_&]:from-black/80 [:fullscreen_&]:to-transparent [:fullscreen_&]:p-4",
        isFullscreen &&
          "z-50 bg-gradient-to-t from-black/80 to-transparent p-4",
        className,
      )}
    />
  );
});
MediaPlayerControls.displayName = CONTROLS_NAME;

interface MediaPlayerPlayButtonProps
  extends React.ComponentPropsWithoutRef<"button"> {
  asChild?: boolean;
}

const MediaPlayerPlayButton = React.forwardRef<
  HTMLButtonElement,
  MediaPlayerPlayButtonProps
>((props, forwardedRef) => {
  const { asChild, ...playButtonProps } = props;
  const context = useMediaPlayerContext(PLAY_BUTTON_NAME);
  const isPlaying = useStore((state) => state.media.isPlaying);

  const onPlay = React.useCallback(() => {
    const media = context.mediaRef.current;
    if (!media) return;

    media.play();
  }, [context.mediaRef]);

  const onPause = React.useCallback(() => {
    const media = context.mediaRef.current;
    if (!media) return;

    media.pause();
  }, [context.mediaRef]);

  const PlayButtonPrimitive = asChild ? Slot : "button";

  return (
    <PlayButtonPrimitive
      type="button"
      aria-label={isPlaying ? "Pause" : "Play"}
      data-state={isPlaying ? "playing" : "paused"}
      data-slot="media-player-play-button"
      {...playButtonProps}
      ref={forwardedRef}
      onClick={isPlaying ? onPause : onPlay}
    >
      {isPlaying ? <PauseIcon /> : <PlayIcon />}
    </PlayButtonPrimitive>
  );
});
MediaPlayerPlayButton.displayName = PLAY_BUTTON_NAME;

interface MediaPlayerSeekProps extends React.ComponentPropsWithoutRef<"input"> {
  asChild?: boolean;
}

const MediaPlayerSeek = React.forwardRef<
  HTMLInputElement,
  MediaPlayerSeekProps
>((props, forwardedRef) => {
  const { asChild, className, ...seekProps } = props;
  const context = useMediaPlayerContext(SEEK_NAME);
  const store = useStoreContext(SEEK_NAME);
  const currentTime = useStore((state) => state.media.currentTime);
  const duration = useStore((state) => state.media.duration);

  const onSeek = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const media = context.mediaRef.current;
      if (!media) return;

      const time = Number.parseFloat(event.target.value);
      media.currentTime = time;
      store.dispatch({ variant: "SET_CURRENT_TIME", currentTime: time });
    },
    [context.mediaRef, store],
  );

  const SeekPrimitive = asChild ? Slot : "input";

  return (
    <SeekPrimitive
      type="range"
      min={0}
      max={duration || 100}
      step="any"
      value={currentTime}
      aria-label="Seek"
      data-slot="media-player-seek"
      {...seekProps}
      ref={forwardedRef}
      className={cn(
        "h-1 w-full cursor-pointer appearance-none rounded-full bg-primary/20",
        "[&::-webkit-slider-thumb]:h-3",
        "[&::-webkit-slider-thumb]:w-3",
        "[&::-webkit-slider-thumb]:appearance-none",
        "[&::-webkit-slider-thumb]:rounded-full",
        "[&::-webkit-slider-thumb]:bg-primary",
        className,
      )}
      onChange={onSeek}
    />
  );
});
MediaPlayerSeek.displayName = SEEK_NAME;

interface MediaPlayerVolumeProps
  extends React.ComponentPropsWithoutRef<"input"> {
  asChild?: boolean;
}

const MediaPlayerVolume = React.forwardRef<
  HTMLInputElement,
  MediaPlayerVolumeProps
>((props, forwardedRef) => {
  const { asChild, className, ...volumeProps } = props;
  const context = useMediaPlayerContext(VOLUME_NAME);
  const store = useStoreContext(VOLUME_NAME);
  const volume = useStore((state) => state.media.volume);
  const isMuted = useStore((state) => state.media.isMuted);

  const onVolumeChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const media = context.mediaRef.current;
      if (!media) return;

      const volume = Number.parseFloat(event.target.value);
      media.volume = volume;
      media.muted = volume === 0;
      store.dispatch({ variant: "SET_VOLUME", volume });
      store.dispatch({ variant: "SET_MUTED", isMuted: volume === 0 });
    },
    [context.mediaRef, store],
  );

  const onMute = React.useCallback(() => {
    const media = context.mediaRef.current;
    if (!media) return;

    media.muted = !media.muted;
    store.dispatch({ variant: "SET_MUTED", isMuted: media.muted });
  }, [context.mediaRef, store]);

  const VolumePrimitive = asChild ? Slot : "input";

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        aria-label={isMuted ? "Unmute" : "Mute"}
        data-state={isMuted ? "muted" : "unmuted"}
        data-slot="media-player-mute"
        onClick={onMute}
      >
        {isMuted ? (
          <VolumeXIcon />
        ) : volume > 0.5 ? (
          <Volume2Icon />
        ) : (
          <VolumeIcon />
        )}
      </button>
      <VolumePrimitive
        type="range"
        min={0}
        max={1}
        step="any"
        value={volume}
        aria-label="Volume"
        data-slot="media-player-volume"
        {...volumeProps}
        ref={forwardedRef}
        className={cn(
          "h-1 w-20 cursor-pointer appearance-none rounded-full bg-primary/20",
          "[&::-webkit-slider-thumb]:h-3",
          "[&::-webkit-slider-thumb]:w-3",
          "[&::-webkit-slider-thumb]:appearance-none",
          "[&::-webkit-slider-thumb]:rounded-full",
          "[&::-webkit-slider-thumb]:bg-primary",
          className,
        )}
        onChange={onVolumeChange}
      />
    </div>
  );
});
MediaPlayerVolume.displayName = VOLUME_NAME;

interface MediaPlayerTimeProps extends React.ComponentPropsWithoutRef<"div"> {
  asChild?: boolean;
}

const MediaPlayerTime = React.forwardRef<HTMLDivElement, MediaPlayerTimeProps>(
  (props, forwardedRef) => {
    const { asChild, className, ...timeProps } = props;
    const context = useMediaPlayerContext(TIME_NAME);
    const currentTime = useStore((state) => state.media.currentTime);
    const duration = useStore((state) => state.media.duration);

    function formatTime(time: number) {
      const minutes = Math.floor(time / 60);
      const seconds = Math.floor(time % 60);
      return `${minutes}:${seconds.toString().padStart(2, "0")}`;
    }

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
        <span>{formatTime(duration || 0)}</span>
      </TimePrimitive>
    );
  },
);
MediaPlayerTime.displayName = TIME_NAME;

interface MediaPlayerFullscreenProps
  extends React.ComponentPropsWithoutRef<"button"> {
  asChild?: boolean;
}

const MediaPlayerFullscreen = React.forwardRef<
  HTMLButtonElement,
  MediaPlayerFullscreenProps
>((props, forwardedRef) => {
  const { asChild, ...fullscreenProps } = props;
  const context = useMediaPlayerContext(FULLSCREEN_NAME);
  const store = useStoreContext(FULLSCREEN_NAME);
  const isFullscreen = useStore((state) => state.media.isFullscreen);

  const onFullscreen = React.useCallback(() => {
    const media = context.mediaRef.current;
    if (!media) return;

    if (!document.fullscreenElement) {
      const container = media.closest('[data-slot="media-player"]');
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
  }, [context.mediaRef, store]);

  const FullscreenPrimitive = asChild ? Slot : "button";

  return (
    <FullscreenPrimitive
      type="button"
      aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
      data-state={isFullscreen ? "fullscreen" : "windowed"}
      data-slot="media-player-fullscreen"
      {...fullscreenProps}
      ref={forwardedRef}
      onClick={onFullscreen}
    >
      {isFullscreen ? <MinimizeIcon /> : <FullscreenIcon />}
    </FullscreenPrimitive>
  );
});
MediaPlayerFullscreen.displayName = FULLSCREEN_NAME;

interface MediaPlayerVideoProps
  extends React.ComponentPropsWithoutRef<"video"> {
  asChild?: boolean;
  controls?: boolean;
}

const MediaPlayerVideo = React.forwardRef<
  HTMLVideoElement,
  MediaPlayerVideoProps
>((props, forwardedRef) => {
  const { asChild, className, controls = false, ...videoProps } = props;
  const context = useMediaPlayerContext(VIDEO_NAME);
  const isLooping = useStore((state) => state.media.isLooping);

  const VideoPrimitive = asChild ? Slot : "video";

  return (
    <VideoPrimitive
      ref={(node) => {
        if (typeof forwardedRef === "function") forwardedRef(node);
        else if (forwardedRef) forwardedRef.current = node;
        if (context.mediaRef && node)
          (context.mediaRef as React.RefObject<HTMLVideoElement>).current =
            node;
      }}
      loop={isLooping}
      playsInline
      preload="metadata"
      data-slot="media-player-video"
      disablePictureInPicture
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

  const AudioPrimitive = asChild ? Slot : "audio";

  return (
    <AudioPrimitive
      ref={(node) => {
        if (typeof forwardedRef === "function") forwardedRef(node);
        else if (forwardedRef) forwardedRef.current = node;
        if (context.mediaRef && node)
          (context.mediaRef as React.RefObject<HTMLAudioElement>).current =
            node;
      }}
      loop={isLooping}
      preload="metadata"
      data-slot="media-player-audio"
      {...audioProps}
      className={cn("w-full", className)}
    />
  );
});
MediaPlayerAudio.displayName = AUDIO_NAME;

const MediaPlayer = MediaPlayerRoot;
const Root = MediaPlayerRoot;
const Controls = MediaPlayerControls;
const PlayButton = MediaPlayerPlayButton;
const Seek = MediaPlayerSeek;
const Volume = MediaPlayerVolume;
const Time = MediaPlayerTime;
const Fullscreen = MediaPlayerFullscreen;
const Video = MediaPlayerVideo;
const Audio = MediaPlayerAudio;

export {
  MediaPlayer,
  MediaPlayerControls,
  MediaPlayerPlayButton,
  MediaPlayerSeek,
  MediaPlayerVolume,
  MediaPlayerTime,
  MediaPlayerFullscreen,
  MediaPlayerVideo,
  MediaPlayerAudio,
  //
  Root,
  Controls,
  PlayButton,
  Seek,
  Volume,
  Time,
  Fullscreen,
  Video,
  Audio,
  //
  useStore as useMediaPlayer,
};
