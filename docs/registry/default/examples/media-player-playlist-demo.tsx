"use client";

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
} from "@/registry/default/ui/media-player";
import {
  ListMusicIcon,
  PauseCircleIcon,
  PlayCircleIcon,
  SkipBackIcon,
  SkipForwardIcon,
} from "lucide-react";
import * as React from "react";

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
  {
    id: "3",
    title: "The Cradle of Your Soul",
    artist: "Angelwing",
    src: "https://www.dropbox.com/s/ayf4cwdytqafs70/The%20Calling%20%20-%20Angelwing.mp3?raw=1",
    cover: "https://picsum.photos/seed/calling/200/200",
  },
  {
    id: "4",
    title: "Happy Days",
    artist: "FSM Team",
    src: "https://www.free-stock-music.com/music/fsm-team-happy-days.mp3",
    cover: "https://picsum.photos/seed/happydays/200/200",
  },
];

export default function MediaPlayerPlaylistDemo() {
  const [currentTrackIndex, setCurrentTrackIndex] = React.useState(0);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  const currentTrack = React.useMemo(
    () => tracks[currentTrackIndex],
    [currentTrackIndex],
  );

  const onPlay = React.useCallback(() => {
    setIsPlaying(true);
  }, []);

  const onPause = React.useCallback(() => {
    setIsPlaying(false);
  }, []);

  const onEnded = React.useCallback(() => {
    onNextTrack();
  }, []);

  const onPlayTrack = React.useCallback((index: number) => {
    const trackToPlay = tracks[index];
    if (!trackToPlay) {
      console.error({ error: `Track at index ${index} not found.` });
      return;
    }
    setCurrentTrackIndex(index);
    setIsPlaying(true);
    if (audioRef.current) {
      audioRef.current.src = trackToPlay.src;
      audioRef.current.load();
      audioRef.current.play().catch((error) => console.error({ error }));
    }
  }, []);

  const onTogglePlayPauseTrack = (index: number) => {
    if (index === currentTrackIndex) {
      if (isPlaying) {
        audioRef.current?.pause();
      } else {
        audioRef.current?.play().catch((error) => console.error({ error }));
      }
      setIsPlaying(!isPlaying);
    } else {
      onPlayTrack(index);
    }
  };

  const onNextTrack = React.useCallback(() => {
    const nextIndex = (currentTrackIndex + 1) % tracks.length;
    onPlayTrack(nextIndex);
  }, [currentTrackIndex, onPlayTrack]);

  const onPreviousTrack = React.useCallback(() => {
    const prevIndex = (currentTrackIndex - 1 + tracks.length) % tracks.length;
    onPlayTrack(prevIndex);
  }, [currentTrackIndex, onPlayTrack]);

  React.useEffect(() => {
    if (audioRef.current && currentTrack) {
      audioRef.current.src = currentTrack.src;
      audioRef.current.load();
      if (isPlaying) {
        audioRef.current.play().catch((error) => console.error({ error }));
      }
    }
  }, [currentTrack?.src, isPlaying, currentTrack]);

  if (!currentTrack) {
    return <div>Loading track...</div>;
  }

  return (
    <MediaPlayer
      onPlay={onPlay}
      onPause={onPause}
      onEnded={onEnded}
      className="w-full max-w-2xl overflow-hidden rounded-lg border bg-background shadow-lg"
    >
      <MediaPlayerAudio
        ref={audioRef}
        src={currentTrack.src}
        className="sr-only"
      />
      <div className="flex w-full flex-col items-center gap-4 py-4 md:items-start">
        <div className="w-full overflow-hidden rounded-md rounded-b-none">
          <img
            src={currentTrack.cover}
            alt={currentTrack.title}
            className="aspect-video w-full object-cover transition-all hover:scale-105"
          />
        </div>
        <div className="flex flex-col gap-1 px-4">
          <h2 className="font-semibold text-2xl text-foreground tracking-tight">
            {currentTrack.title}
          </h2>
          <p className="text-muted-foreground text-sm">{currentTrack.artist}</p>
        </div>
        <div className="w-full border-t">
          <div className="flex items-center justify-between border-border border-b p-4">
            <div className="flex items-center gap-2">
              <h3 className="font-medium text-lg tracking-tight">Playlist</h3>
              <ListMusicIcon className="size-4" />
            </div>
            <span className="text-muted-foreground text-sm">{`${currentTrackIndex + 1} / ${tracks.length}`}</span>
          </div>
          <ScrollArea className="flex max-h-[240px] flex-col">
            {tracks.map((track, index) => (
              <button
                key={track.id}
                onClick={() => onTogglePlayPauseTrack(index)}
                className={cn(
                  "group flex w-full items-center gap-4 p-4 text-left transition-colors duration-150 hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                  index === currentTrackIndex && "bg-muted",
                )}
              >
                <img
                  src={track.cover}
                  alt={track.title}
                  className="aspect-square size-10 rounded object-cover"
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
                {index === currentTrackIndex && isPlaying ? (
                  <PauseCircleIcon className="size-6 text-primary" />
                ) : index === currentTrackIndex && !isPlaying ? (
                  <PlayCircleIcon className="size-6 text-muted-foreground" />
                ) : (
                  <PlayCircleIcon className="size-6 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                )}
              </button>
            ))}
          </ScrollArea>
        </div>
        <MediaPlayerControls className="relative flex w-full flex-col gap-2.5">
          <MediaPlayerSeek />
          <div className="flex w-full items-center justify-center gap-2">
            <MediaPlayerTooltip tooltip="Previous track">
              <Button
                aria-label="Previous track"
                variant="ghost"
                size="icon"
                className="size-8"
                onClick={onPreviousTrack}
              >
                <SkipBackIcon />
              </Button>
            </MediaPlayerTooltip>
            <MediaPlayerPlay />
            <MediaPlayerTooltip tooltip="Next track">
              <Button
                aria-label="Next track"
                variant="ghost"
                size="icon"
                className="size-8"
                onClick={onNextTrack}
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
