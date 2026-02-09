"use client";

import {
  ListMusicIcon,
  Loader2Icon,
  PauseCircleIcon,
  PlayCircleIcon,
  SkipBackIcon,
  SkipForwardIcon,
} from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  MediaPlayer,
  MediaPlayerAudio,
  MediaPlayerControls,
  MediaPlayerPlay,
  MediaPlayerSeek,
  MediaPlayerTime,
  MediaPlayerTooltip,
  MediaPlayerVolume,
} from "@/registry/bases/radix/ui/media-player";

interface Track {
  id: string;
  title: string;
  artist: string;
  src: string;
  cover: string;
}

const tracks: Track[] = [
  {
    id: "1",
    title: "Medieval: Battle",
    artist: "RandomMind",
    src: "https://opengameart.org/sites/default/files/battle.mp3",
    cover: "https://picsum.photos/seed/battle/200/200",
  },
  {
    id: "2",
    title: "City Lights",
    artist: "The Lemming Shepherds",
    src: "https://www.dropbox.com/s/mvvwaw1msplnteq/City%20Lights%20-%20The%20Lemming%20Shepherds.mp3?raw=1",
    cover: "https://picsum.photos/seed/citylights/200/200",
  },
];

export default function MediaPlayerPlaylistDemo() {
  const [currentTrackIndex, setCurrentTrackIndex] = React.useState(0);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  const shouldPlayAfterLoad = React.useRef(false);

  const onPlay = React.useCallback(() => {
    setIsPlaying(true);
  }, []);

  const onPause = React.useCallback(() => {
    setIsPlaying(false);
  }, []);

  const onLoadAndPlayTrack = React.useCallback(
    async (index: number, shouldPlay = true) => {
      const trackToPlay = tracks[index];
      if (!trackToPlay) {
        toast.error("Track not found");
        return;
      }

      if (!audioRef.current) return;

      if (!audioRef.current.paused) {
        audioRef.current.pause();
      }

      setCurrentTrackIndex(index);
      setIsLoading(true);
      shouldPlayAfterLoad.current = shouldPlay;

      audioRef.current.src = trackToPlay.src;
      audioRef.current.load();
    },
    [],
  );

  const onPlayTrack = React.useCallback(
    (index: number) => {
      onLoadAndPlayTrack(index, true);
    },
    [onLoadAndPlayTrack],
  );

  const onPreviousTrack = React.useCallback(() => {
    const prevIndex = (currentTrackIndex - 1 + tracks.length) % tracks.length;
    onPlayTrack(prevIndex);
  }, [currentTrackIndex, onPlayTrack]);

  const onNextTrack = React.useCallback(() => {
    const nextIndex = (currentTrackIndex + 1) % tracks.length;
    onPlayTrack(nextIndex);
  }, [currentTrackIndex, onPlayTrack]);

  const onEnded = React.useCallback(() => {
    onNextTrack();
  }, [onNextTrack]);

  const onAudioPlay = React.useCallback(async () => {
    if (!audioRef.current) return;

    try {
      await audioRef.current.play();
      setIsPlaying(true);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to play track",
      );
      setIsPlaying(false);
    }
  }, []);

  const onTogglePlayPauseTrack = React.useCallback(
    (index: number) => {
      if (index === currentTrackIndex) {
        if (isPlaying) {
          audioRef.current?.pause();
        } else {
          onAudioPlay();
        }
      } else {
        onPlayTrack(index);
      }
    },
    [currentTrackIndex, isPlaying, onAudioPlay, onPlayTrack],
  );

  const currentTrack = React.useMemo(
    () => tracks[currentTrackIndex],
    [currentTrackIndex],
  );

  React.useEffect(() => {
    const audioElement = audioRef.current;
    if (!audioElement) return;

    const onCanPlay = () => {
      setIsLoading(false);
      if (shouldPlayAfterLoad.current) {
        onAudioPlay();
        shouldPlayAfterLoad.current = false;
      }
    };

    const onLoadStart = () => {
      setIsLoading(true);
    };

    const onError = () => {
      setIsLoading(false);
      setIsPlaying(false);
      toast.error("Failed to load track");
    };

    audioElement.addEventListener("canplay", onCanPlay);
    audioElement.addEventListener("loadstart", onLoadStart);
    audioElement.addEventListener("error", onError);

    return () => {
      audioElement.removeEventListener("canplay", onCanPlay);
      audioElement.removeEventListener("loadstart", onLoadStart);
      audioElement.removeEventListener("error", onError);
    };
  }, [onAudioPlay]);

  React.useEffect(() => {
    if (
      audioRef.current &&
      currentTrack &&
      audioRef.current.src !== currentTrack.src
    ) {
      onLoadAndPlayTrack(currentTrackIndex, false);
    }
  }, [currentTrack, currentTrackIndex, onLoadAndPlayTrack]);

  const onKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      const isMediaFocused = event.currentTarget.contains(
        document.activeElement,
      );

      if (!isMediaFocused) return;

      switch (event.key.toLowerCase()) {
        case "n":
          event.preventDefault();
          onNextTrack();
          break;

        case "p":
          event.preventDefault();
          onPreviousTrack();
          break;
      }
    },
    [onNextTrack, onPreviousTrack],
  );

  if (!currentTrack) return null;

  return (
    <MediaPlayer
      onPlay={onPlay}
      onPause={onPause}
      onEnded={onEnded}
      onKeyDown={onKeyDown}
      className="w-full max-w-2xl overflow-hidden rounded-lg border bg-background shadow-lg"
    >
      <MediaPlayerAudio
        ref={audioRef}
        src={currentTrack.src}
        className="sr-only"
      />
      <div className="flex w-full flex-col items-center gap-4 md:items-start">
        <div className="relative w-full overflow-hidden rounded-md rounded-b-none border-b">
          {/* biome-ignore lint/performance/noImgElement: dynamic cover URLs from playlist tracks don't work well with Next.js Image optimization */}
          <img
            src={currentTrack.cover}
            alt={currentTrack.title}
            className="h-40 w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          <div className="absolute right-0 bottom-0 left-0 p-4">
            <h2 className="font-semibold text-2xl text-white tracking-tight drop-shadow-lg">
              {currentTrack.title}
            </h2>
            <p className="text-sm text-white/90 drop-shadow-md">
              {currentTrack.artist}
            </p>
          </div>
        </div>
        <div className="w-full">
          <div className="flex items-center border-border border-b px-4 pb-4">
            <div className="flex flex-1 items-center gap-2">
              <h3 className="font-medium text-lg tracking-tight">Playlist</h3>
              <ListMusicIcon className="size-4" />
            </div>
            <span className="text-muted-foreground text-sm">{`${currentTrackIndex + 1} / ${tracks.length}`}</span>
          </div>
          <ScrollArea className="max-h-[200px]">
            {tracks.map((track, index) => (
              <Button
                key={track.id}
                variant="ghost"
                className={cn(
                  "h-auto w-full rounded-none px-4 py-3 text-left",
                  index === currentTrackIndex && "bg-accent",
                )}
                onClick={() => onTogglePlayPauseTrack(index)}
                disabled={isLoading}
              >
                {/* biome-ignore lint/performance/noImgElement: dynamic cover URLs from playlist tracks don't work well with Next.js Image optimization */}
                <img
                  src={track.cover}
                  alt={track.title}
                  className="aspect-square size-9 rounded object-cover"
                />
                <div className="flex flex-1 flex-col">
                  <span
                    className={cn(
                      "font-medium leading-tight",
                      index === currentTrackIndex && "text-primary",
                    )}
                  >
                    {track.title}
                  </span>
                  <span className="text-muted-foreground text-sm">
                    {track.artist}
                  </span>
                </div>
                {index === currentTrackIndex && isLoading ? (
                  <Loader2Icon className="size-6 animate-spin text-primary" />
                ) : index === currentTrackIndex && isPlaying ? (
                  <PauseCircleIcon className="size-6 text-primary" />
                ) : index === currentTrackIndex && !isPlaying ? (
                  <PlayCircleIcon className="size-6 text-muted-foreground" />
                ) : (
                  <PlayCircleIcon className="size-6 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                )}
              </Button>
            ))}
          </ScrollArea>
        </div>
        <MediaPlayerControls className="relative flex w-full flex-col gap-2.5">
          <MediaPlayerSeek />
          <div className="flex w-full items-center justify-center gap-2">
            <MediaPlayerTooltip tooltip="Previous track" shortcut="B">
              <Button
                aria-label="Previous track"
                variant="ghost"
                size="icon"
                className="size-8"
                onClick={onPreviousTrack}
                disabled={isLoading}
              >
                <SkipBackIcon />
              </Button>
            </MediaPlayerTooltip>
            <MediaPlayerPlay />
            <MediaPlayerTooltip tooltip="Next track" shortcut="N">
              <Button
                aria-label="Next track"
                variant="ghost"
                size="icon"
                className="size-8"
                onClick={onNextTrack}
                disabled={isLoading}
              >
                <SkipForwardIcon />
              </Button>
            </MediaPlayerTooltip>
            <MediaPlayerTime variant="progress" />
            <MediaPlayerVolume className="ml-auto" />
          </div>
        </MediaPlayerControls>
      </div>
    </MediaPlayer>
  );
}
