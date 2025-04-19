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
  FastForwardIcon,
  Maximize2Icon,
  Minimize2Icon,
  PauseIcon,
  PictureInPicture2Icon,
  PictureInPictureIcon,
  PlayIcon,
  Repeat1Icon,
  RepeatIcon,
  RewindIcon,
  SubtitlesIcon,
  Volume1Icon,
  Volume2Icon,
  VolumeXIcon,
} from "lucide-react";
import * as React from "react";

const POINTER_MOVE_THROTTLE_MS = 16;
const SEEK_THROTTLE_MS = 100;
const SEEK_AMOUNT_SHORT = 5;
const SEEK_AMOUNT_LONG = 10;
const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

const ROOT_NAME = "MediaPlayer";
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

const MEDIA_PLAYER_ERRORS = {
  [ROOT_NAME]: `\`${ROOT_NAME}\` must be used as root component`,
  [VIDEO_NAME]: `\`${VIDEO_NAME}\` must be within \`${ROOT_NAME}\``,
  [AUDIO_NAME]: `\`${AUDIO_NAME}\` must be within \`${ROOT_NAME}\``,
  [CONTROLS_NAME]: `\`${CONTROLS_NAME}\` must be within \`${ROOT_NAME}\``,
  [OVERLAY_NAME]: `\`${OVERLAY_NAME}\` must be within \`${ROOT_NAME}\``,
  [PLAY_NAME]: `\`${PLAY_NAME}\` must be within \`${ROOT_NAME}\``,
  [SEEK_BACKWARD_NAME]: `\`${SEEK_BACKWARD_NAME}\` must be within \`${ROOT_NAME}\``,
  [SEEK_FORWARD_NAME]: `\`${SEEK_FORWARD_NAME}\` must be within \`${ROOT_NAME}\``,
  [SEEK_NAME]: `\`${SEEK_NAME}\` must be within \`${ROOT_NAME}\``,
  [VOLUME_NAME]: `\`${VOLUME_NAME}\` must be within \`${ROOT_NAME}\``,
  [TIME_NAME]: `\`${TIME_NAME}\` must be within \`${ROOT_NAME}\``,
  [PLAYBACK_SPEED_NAME]: `\`${PLAYBACK_SPEED_NAME}\` must be within \`${ROOT_NAME}\``,
  [LOOP_NAME]: `\`${LOOP_NAME}\` must be within \`${ROOT_NAME}\``,
  [FULLSCREEN_NAME]: `\`${FULLSCREEN_NAME}\` must be within \`${ROOT_NAME}\``,
  [PIP_NAME]: `\`${PIP_NAME}\` must be within \`${ROOT_NAME}\``,
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

function formatTime(time: number) {
  const hours = Math.floor(time / 3600);
  const minutes = Math.floor((time % 3600) / 60);
  const seconds = Math.floor(time % 60);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function getIsVideo(
  mediaRef: React.RefObject<HTMLVideoElement | HTMLAudioElement | null>,
) {
  return (
    typeof window !== "undefined" &&
    mediaRef.current instanceof HTMLVideoElement
  );
}

type Direction = "ltr" | "rtl";

const DirectionContext = React.createContext<Direction | undefined>(undefined);

function useDirection(dirProp?: Direction): Direction {
  const contextDir = React.useContext(DirectionContext);
  return dirProp ?? contextDir ?? "ltr";
}

type LoopMode = "off" | "all" | "one";

interface MediaState {
  isPlaying: boolean;
  isMuted: boolean;
  volume: number;
  currentTime: number;
  duration: number;
  buffered: TimeRanges | null;
  isFullscreen: boolean;
  isLooping: boolean;
  loopMode: LoopMode;
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
  | { variant: "SET_LOOP_MODE"; loopMode: LoopMode }
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

      case "SET_LOOP_MODE":
        state = {
          ...state,
          media: { ...state.media, loopMode: action.loopMode },
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
  mediaId: string;
  labelId: string;
  descriptionId: string;
  dir: Direction;
  disabled: boolean;
  mediaRef: React.RefObject<HTMLVideoElement | HTMLAudioElement | null>;
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
      disabled = false,
      dir: dirProp,
      label,
      children,
      className,
      ...rootProps
    } = props;

    const mediaId = React.useId();
    const labelId = React.useId();
    const descriptionId = React.useId();

    const dir = useDirection(dirProp);
    const propsRef = useAsRef(props);
    const listeners = useLazyRef(() => new Set<() => void>()).current;

    const mediaRef = React.useRef<HTMLVideoElement | HTMLAudioElement>(null);
    const previousVolumeRef = React.useRef(defaultVolume);

    const initialState = React.useMemo<MediaState>(() => {
      return {
        isPlaying: mediaRef.current?.autoplay ?? false,
        isMuted: mediaRef.current?.muted ?? false,
        volume: mediaRef.current?.volume ?? defaultVolume,
        currentTime: 0,
        duration: 0,
        buffered: null,
        isFullscreen: false,
        isLooping: mediaRef.current?.loop ?? false,
        loopMode: mediaRef.current?.loop ? "all" : "off",
        playbackRate: 1,
        isPictureInPicture: false,
        captionsEnabled: false,
      };
    }, [defaultVolume]);

    const store = React.useMemo(
      () => createStore(listeners, initialState),
      [listeners, initialState],
    );

    const contextValue = React.useMemo<MediaPlayerContextValue>(
      () => ({
        mediaId,
        labelId,
        descriptionId,
        mediaRef,
        dir,
        disabled,
      }),
      [mediaId, labelId, descriptionId, dir, disabled],
    );

    const onKeyDown = React.useCallback(
      (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (disabled) return;

        propsRef.current.onKeyDown?.(event);

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
            if (media.paused) {
              media.play();
            } else {
              media.pause();
            }
            break;

          case "f":
            event.preventDefault();
            if (!document.fullscreenElement) {
              const container = media.closest('[data-slot="media-player"]');
              if (container) {
                container.requestFullscreen();
              } else {
                media.requestFullscreen();
              }
            } else {
              document.exitFullscreen();
            }
            break;

          case "m": {
            event.preventDefault();
            const currentVolume = store.getState().media.volume;
            const currentMuted = store.getState().media.isMuted;
            if (!currentMuted) {
              previousVolumeRef.current =
                currentVolume > 0 ? currentVolume : previousVolumeRef.current;
              store.dispatch({ variant: "SET_VOLUME", volume: 0 });
              store.dispatch({ variant: "SET_MUTED", isMuted: true });
              if (media) {
                media.volume = 0;
                media.muted = true;
              }
            } else {
              const restoredVolume = previousVolumeRef.current || 1;
              store.dispatch({
                variant: "SET_VOLUME",
                volume: restoredVolume,
              });
              store.dispatch({ variant: "SET_MUTED", isMuted: false });
              if (media) {
                media.volume = restoredVolume;
                media.muted = false;
              }
            }
            break;
          }

          case "arrowright":
            event.preventDefault();
            if (media instanceof HTMLVideoElement) {
              media.currentTime = Math.min(
                media.duration,
                media.currentTime + SEEK_AMOUNT_SHORT,
              );
            } else if (media instanceof HTMLAudioElement && event.shiftKey) {
              media.currentTime = Math.min(
                media.duration,
                media.currentTime + SEEK_AMOUNT_SHORT,
              );
            }
            break;

          case "arrowleft":
            event.preventDefault();
            if (media instanceof HTMLVideoElement) {
              media.currentTime = Math.max(
                0,
                media.currentTime - SEEK_AMOUNT_SHORT,
              );
            } else if (media instanceof HTMLAudioElement && event.shiftKey) {
              media.currentTime = Math.max(
                0,
                media.currentTime - SEEK_AMOUNT_SHORT,
              );
            }
            break;

          case "arrowup":
            event.preventDefault();
            if (media instanceof HTMLVideoElement) {
              media.volume = Math.min(1, media.volume + 0.1);
            }
            break;

          case "arrowdown":
            event.preventDefault();
            if (media instanceof HTMLVideoElement) {
              media.volume = Math.max(0, media.volume - 0.1);
            }
            break;

          case "<": {
            event.preventDefault();
            const decreaseRate = store.getState().media.playbackRate;
            const decreaseIndex = SPEEDS.indexOf(decreaseRate);
            const newDecreaseIndex = Math.max(0, decreaseIndex - 1);
            const newDecreaseRate = SPEEDS[newDecreaseIndex] ?? 1;

            media.playbackRate = newDecreaseRate;
            store.dispatch({
              variant: "SET_PLAYBACK_RATE",
              playbackRate: newDecreaseRate,
            });
            break;
          }

          case ">": {
            event.preventDefault();
            const increaseRate = store.getState().media.playbackRate;
            const increaseIndex = SPEEDS.indexOf(increaseRate);
            const newIncreaseIndex = Math.min(
              SPEEDS.length - 1,
              increaseIndex + 1,
            );
            const newIncreaseRate = SPEEDS[newIncreaseIndex] ?? 1;

            media.playbackRate = newIncreaseRate;
            store.dispatch({
              variant: "SET_PLAYBACK_RATE",
              playbackRate: newIncreaseRate,
            });
            break;
          }

          case "c":
            event.preventDefault();
            if (
              media instanceof HTMLVideoElement &&
              media.textTracks.length > 0
            ) {
              const captionsEnabled = store.getState().media.captionsEnabled;
              for (let i = 0; i < media.textTracks.length; i++) {
                const track = media.textTracks[i];
                if (
                  track &&
                  (track.kind === "captions" || track.kind === "subtitles")
                ) {
                  track.mode = captionsEnabled ? "hidden" : "showing";
                }
              }
              store.dispatch({
                variant: "SET_CAPTIONS_ENABLED",
                captionsEnabled: !captionsEnabled,
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
              if (document.pictureInPictureElement === media) {
                document.exitPictureInPicture().catch((error) => {
                  propsRef.current.onPipError?.(error, "exit");
                });
              } else {
                media.requestPictureInPicture().catch((error) => {
                  propsRef.current.onPipError?.(error, "enter");
                });
              }
            }
            break;
          }

          case "r": {
            event.preventDefault();
            const currentLoopMode = store.getState().media.loopMode;
            if (currentLoopMode === "one") {
              if (media) {
                media.currentTime = 0;
                media.play();
                store.dispatch({ variant: "SET_LOOP_MODE", loopMode: "off" });
              }
            } else {
              store.dispatch({ variant: "SET_LOOP_MODE", loopMode: "one" });
            }
            break;
          }

          case "j": {
            event.preventDefault();
            if (media instanceof HTMLVideoElement) {
              media.currentTime = Math.max(
                0,
                media.currentTime - SEEK_AMOUNT_LONG,
              );
            }
            break;
          }

          case "l": {
            event.preventDefault();
            if (media instanceof HTMLVideoElement) {
              media.currentTime = Math.min(
                media.duration,
                media.currentTime + SEEK_AMOUNT_LONG,
              );
            }
            break;
          }
        }
      },
      [
        store,
        propsRef.current.onKeyDown,
        propsRef.current.onPipError,
        disabled,
      ],
    );

    const initialVolumeSetRef = React.useRef(false);

    React.useEffect(() => {
      const media = mediaRef.current;
      if (!media) return;

      if (!initialVolumeSetRef.current) {
        const initialVolumeProp = propsRef.current.defaultVolume;
        if (
          typeof initialVolumeProp === "number" &&
          media.volume !== initialVolumeProp
        ) {
          media.volume = initialVolumeProp;
        }
        initialVolumeSetRef.current = true;
      }

      if (media.muted !== store.getState().media.isMuted) {
        const actualVolume = media.muted ? 0 : media.volume;
        if (media.muted && store.getState().media.volume !== 0) {
          previousVolumeRef.current = store.getState().media.volume;
        }
        store.dispatch({ variant: "SET_MUTED", isMuted: media.muted });
        store.dispatch({ variant: "SET_VOLUME", volume: actualVolume });
      }
      if (media.volume !== store.getState().media.volume && !media.muted) {
        store.dispatch({ variant: "SET_VOLUME", volume: media.volume });
      }

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
        const currentLoopMode = store.getState().media.loopMode;
        if (currentLoopMode === "one") {
          if (media) {
            media.currentTime = 0;
            media.play();
            store.dispatch({ variant: "SET_LOOP_MODE", loopMode: "off" });
          }
        } else {
          store.dispatch({ variant: "SET_PLAYING", isPlaying: false });
          propsRef.current.onEnded?.();
        }
      };

      const onVolumeChange = () => {
        const currentVolume = media.muted ? 0 : media.volume;
        if (
          media.muted &&
          !store.getState().media.isMuted &&
          media.volume > 0
        ) {
          previousVolumeRef.current = media.volume;
        }
        store.dispatch({ variant: "SET_VOLUME", volume: currentVolume });
        store.dispatch({ variant: "SET_MUTED", isMuted: media.muted });
        propsRef.current.onVolumeChange?.(media.volume);
        propsRef.current.onMuted?.(media.muted);
      };

      const onFullscreenChange = () => {
        const isFullscreen = !!document.fullscreenElement;
        store.dispatch({
          variant: "SET_FULLSCREEN",
          isFullscreen: isFullscreen,
        });
        propsRef.current.onFullscreenChange?.(isFullscreen);
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

      if (media.volume !== store.getState().media.volume) {
        store.dispatch({ variant: "SET_VOLUME", volume: media.volume });
      }

      if (media.muted !== store.getState().media.isMuted) {
        store.dispatch({ variant: "SET_MUTED", isMuted: media.muted });
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
      propsRef.current.defaultVolume,
      propsRef.current.onVolumeChange,
      propsRef.current.onTimeUpdate,
      propsRef.current.onMuted,
      propsRef.current.onPlay,
      propsRef.current.onPause,
      propsRef.current.onEnded,
      propsRef.current.onFullscreenChange,
    ]);

    const RootPrimitive = asChild ? Slot : "div";

    return (
      <StoreContext.Provider value={store}>
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
            {...rootProps}
            ref={forwardedRef}
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
      </StoreContext.Provider>
    );
  },
);
MediaPlayerRoot.displayName = ROOT_NAME;

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
  const loopMode = useStore((state) => state.media.loopMode);
  const composedRef = useComposedRefs(forwardedRef, context.mediaRef);

  const onPlayToggle = React.useCallback(
    (event: React.MouseEvent<HTMLVideoElement>) => {
      props.onClick?.(event);

      if (event.defaultPrevented) return;

      const media = context.mediaRef.current;
      if (!media) return;

      if (media.paused) {
        media.play();
      } else {
        media.pause();
      }
    },
    [context.mediaRef, props.onClick],
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
      loop={loopMode === "all"}
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
  const loopMode = useStore((state) => state.media.loopMode);
  const composedRef = useComposedRefs(forwardedRef, context.mediaRef);

  const AudioPrimitive = asChild ? Slot : "audio";

  return (
    <AudioPrimitive
      aria-labelledby={context.labelId}
      aria-describedby={context.descriptionId}
      data-slot="media-player-audio"
      {...audioProps}
      ref={composedRef}
      id={context.mediaId}
      loop={loopMode === "all"}
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
  const isFullscreen = useStore((state) => state.media.isFullscreen);

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

  const isFullscreen = useStore((state) => state.media.isFullscreen);

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
  const isPlaying = useStore((state) => state.media.isPlaying);

  const isDisabled = disabled || context.disabled;

  const onPlayToggle = React.useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      props.onClick?.(event);

      if (event.defaultPrevented) return;

      const media = context.mediaRef.current;
      if (!media) return;

      if (isPlaying) {
        media.pause();
      } else {
        media.play();
      }
    },
    [context.mediaRef, props.onClick, isPlaying],
  );

  return (
    <MediaPlayerTooltip tooltip={isPlaying ? "Pause" : "Play"} shortcut="Space">
      <Button
        type="button"
        aria-label={isPlaying ? "Pause" : "Play"}
        aria-pressed={isPlaying}
        aria-controls={context.mediaId}
        data-disabled={isDisabled ? "" : undefined}
        data-state={isPlaying ? "playing" : "paused"}
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
        {children ?? (isPlaying ? <PauseIcon /> : <PlayIcon />)}
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
  const isDisabled = props.disabled || context.disabled;

  const isVideo = getIsVideo(context.mediaRef);

  const onSeekBackward = React.useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      props.onClick?.(event);

      if (event.defaultPrevented) return;

      const media = context.mediaRef.current;
      if (!media) return;

      media.currentTime = Math.max(0, media.currentTime - seconds);
    },
    [context.mediaRef, props.onClick, seconds],
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
  const isDisabled = props.disabled || context.disabled;

  const isVideo = getIsVideo(context.mediaRef);

  const onSeekForward = React.useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      props.onClick?.(event);

      if (event.defaultPrevented) return;

      const media = context.mediaRef.current;
      if (!media) return;

      media.currentTime = Math.min(media.duration, media.currentTime + seconds);
    },
    [context.mediaRef, props.onClick, seconds],
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

    const formattedCurrentTime = formatTime(currentTime);
    const formattedDuration = formatTime(duration);
    const formattedHoverTime = formatTime(hoverTime);
    const formattedRemainingTime = formatTime(duration - currentTime);

    const isDisabled = disabled || context.disabled;

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
            data-slot="media-player-seek-buffered"
            className="absolute h-full bg-zinc-400"
            style={{
              left: `${startPercent}%`,
              width: `${widthPercent}%`,
            }}
          />
        );
      });
    }, [buffered, duration]);

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
            min={0}
            max={duration}
            step={0.1}
            className={cn(
              "relative flex w-full touch-none select-none items-center data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
              className,
            )}
            value={[currentTime]}
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
        {duration > 0 && (
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
          <span aria-label="Current time" className="text-sm">
            {formattedCurrentTime}
          </span>
          {SeekWrapper}
          <span aria-label="Remaining time" className="text-sm">
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
  const store = useStoreContext(VOLUME_NAME);
  const volume = useStore((state) => state.media.volume);
  const isMuted = useStore((state) => state.media.isMuted);

  const volumeTriggerId = React.useId();
  const sliderId = React.useId();
  const previousVolumeRef = React.useRef(volume);

  const isDisabled = disabled || context.disabled;

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
      if (volume > 0) {
        previousVolumeRef.current = volume;
      }
      media.muted = true;
    } else {
      const restoredVolume =
        previousVolumeRef.current > 0 ? previousVolumeRef.current : 1;
      media.volume = restoredVolume;
      media.muted = false;
    }
  }, [context.mediaRef, volume, isMuted]);

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
          aria-label={isMuted ? "Unmute" : "Mute"}
          aria-pressed={isMuted}
          aria-controls={`${context.mediaId} ${sliderId}`}
          data-state={isMuted ? "muted" : "unmuted"}
          data-slot="media-player-mute"
          variant="ghost"
          size="icon"
          className="size-8"
          disabled={isDisabled}
          onClick={onMute}
        >
          {isMuted ? (
            <VolumeXIcon />
          ) : volume > 0.5 ? (
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
        aria-valuetext={`${Math.round(volume * 100)}% volume`}
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
        value={[volume]}
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
    const currentTime = useStore((state) => state.media.currentTime);
    const duration = useStore((state) => state.media.duration);

    const formattedCurrentTime = formatTime(currentTime);
    const formattedDuration = formatTime(duration);
    const formattedRemainingTime = formatTime(duration - currentTime);

    const TimePrimitive = asChild ? Slot : "div";

    if (mode === "remaining" || mode === "duration") {
      return (
        <TimePrimitive
          aria-label={mode === "remaining" ? "Remaining time" : "Duration"}
          data-slot="media-player-time"
          dir={context.dir}
          {...timeProps}
          ref={forwardedRef}
          className={cn("text-foreground/80 text-sm", className)}
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
        <span aria-label="Current time">{formattedCurrentTime}</span>
        <span role="presentation" aria-hidden="true">
          /
        </span>
        <span aria-label="Duration">{formattedDuration}</span>
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
  const store = useStoreContext(PLAYBACK_SPEED_NAME);
  const playbackRate = useStore((state) => state.media.playbackRate);

  const isDisabled = disabled || context.disabled;

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

  return (
    <Select
      data-slot="media-player-playback-speed"
      value={playbackRate.toString()}
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
          <SelectValue>{playbackRate}x</SelectValue>
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
  extends React.ComponentPropsWithoutRef<typeof Button> {
  mode?: "toggle" | "repeat";
}

const MediaPlayerLoop = React.forwardRef<
  HTMLButtonElement,
  MediaPlayerLoopProps
>((props, forwardedRef) => {
  const { asChild, children, className, mode = "toggle", ...loopProps } = props;

  const context = useMediaPlayerContext(LOOP_NAME);
  const store = useStoreContext(LOOP_NAME);
  const loopMode = useStore((state) => state.media.loopMode);
  const isDisabled = props.disabled || context.disabled;

  const onLoopToggle = React.useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      props.onClick?.(event);
      if (event.defaultPrevented) return;

      const media = context.mediaRef.current;
      if (!media) return;

      let nextLoopMode: LoopMode = "off";

      if (mode === "toggle") {
        if (loopMode === "off") {
          nextLoopMode = "all";
        } else {
          nextLoopMode = "off";
        }
      } else {
        if (loopMode === "off") {
          nextLoopMode = "all";
        } else if (loopMode === "all") {
          nextLoopMode = "one";
        } else {
          nextLoopMode = "off";
        }
      }

      media.loop = nextLoopMode === "all";
      store.dispatch({ variant: "SET_LOOP_MODE", loopMode: nextLoopMode });
    },
    [context.mediaRef, props.onClick, store, loopMode, mode],
  );

  const getTooltipText = React.useCallback(() => {
    if (mode === "toggle") {
      return loopMode === "all" ? "Disable loop" : "Enable loop";
    }
    if (loopMode === "off") return "Repeat all";
    if (loopMode === "all") return "Repeat one";
    return "Disable repeat";
  }, [loopMode, mode]);

  const getAriaLabel = React.useCallback(() => {
    if (mode === "toggle") {
      return loopMode === "all" ? "Disable loop" : "Enable loop";
    }
    if (loopMode === "off") return "Enable repeat all";
    if (loopMode === "all") return "Enable repeat one";
    return "Disable repeat";
  }, [loopMode, mode]);

  const LoopIcon = React.useCallback(() => {
    if (loopMode === "one") return <Repeat1Icon />;
    return (
      <RepeatIcon className={cn(loopMode === "off" && "text-foreground/60")} />
    );
  }, [loopMode]);

  return (
    <MediaPlayerTooltip tooltip={getTooltipText()} shortcut="R">
      <Button
        type="button"
        aria-label={getAriaLabel()}
        aria-controls={context.mediaId}
        aria-pressed={loopMode !== "off"}
        data-disabled={isDisabled ? "" : undefined}
        data-state={loopMode}
        data-slot="media-player-loop"
        disabled={isDisabled}
        {...loopProps}
        ref={forwardedRef}
        variant="ghost"
        size="icon"
        className={cn("size-8", className)}
        onClick={onLoopToggle}
      >
        {children ?? <LoopIcon />}
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
  const store = useStoreContext(FULLSCREEN_NAME);
  const isFullscreen = useStore((state) => state.media.isFullscreen);

  const isDisabled = disabled || context.disabled;

  const onFullscreen = React.useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      props.onClick?.(event);

      if (event.defaultPrevented) return;

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
    },
    [context.mediaRef, props.onClick, store],
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
    const isPictureInPicture = useStore(
      (state) => state.media.isPictureInPicture,
    );

    const isDisabled = disabled || context.disabled;

    const onPictureInPicture = React.useCallback(
      (event: React.MouseEvent<HTMLButtonElement>) => {
        props.onClick?.(event);

        if (event.defaultPrevented) return;

        const media = context.mediaRef.current;
        if (!media || !(media instanceof HTMLVideoElement)) return;

        if (document.pictureInPictureElement === media) {
          document.exitPictureInPicture().catch((error) => {
            onPipError?.(error, "exit");
          });
        } else {
          media.requestPictureInPicture().catch((error) => {
            onPipError?.(error, "enter");
          });
        }
      },
      [context.mediaRef, props.onClick, onPipError],
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
  const store = useStoreContext(CAPTIONS_NAME);
  const captionsEnabled = useStore((state) => state.media.captionsEnabled);

  const isDisabled = disabled || context.disabled;

  const onToggleCaptions = React.useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      props.onClick?.(event);

      if (event.defaultPrevented) return;
      const media = context.mediaRef.current;
      if (!media) return;

      if (media instanceof HTMLVideoElement && media.textTracks.length > 0) {
        for (let i = 0; i < media.textTracks.length; i++) {
          const track = media.textTracks[i];
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
    <MediaPlayerTooltip tooltip="Captions" shortcut="C">
      <Button
        type="button"
        aria-label={captionsEnabled ? "Disable captions" : "Enable captions"}
        aria-controls={context.mediaId}
        aria-pressed={captionsEnabled}
        data-state={captionsEnabled ? "active" : "inactive"}
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
          (captionsEnabled ? <SubtitlesIcon /> : <CaptionsOffIcon />)}
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
  const mediaUrl = context.mediaRef.current?.currentSrc;

  const isDisabled = disabled || context.disabled;

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
        sideOffset={10}
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
          <kbd
            key={shortcut}
            className="select-none rounded border bg-secondary px-1.5 py-px font-mono text-[0.7rem] text-foreground shadow-xs"
          >
            <abbr title={shortcut} className="no-underline">
              {shortcut}
            </abbr>
          </kbd>
        )}
      </TooltipContent>
    </Tooltip>
  );
}

const MediaPlayer = MediaPlayerRoot;
const Root = MediaPlayerRoot;
const Controls = MediaPlayerControls;
const Overlay = MediaPlayerOverlay;
const Play = MediaPlayerPlay;
const SeekForward = MediaPlayerSeekForward;
const SeekBackward = MediaPlayerSeekBackward;
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
const Loop = MediaPlayerLoop;

export {
  MediaPlayer,
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
  Root,
  Video,
  Audio,
  Controls,
  Overlay,
  Play,
  SeekBackward,
  SeekForward,
  Seek,
  Volume,
  Time,
  PlaybackSpeed,
  Loop,
  Fullscreen,
  PiP,
  Captions,
  Download,
  //
  useStore as useMediaPlayer,
};
