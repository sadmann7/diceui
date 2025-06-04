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
  MediaPlayerVolume,
} from "@/registry/default/ui/media-player";
import { ListMusicIcon, PauseCircleIcon, PlayCircleIcon } from "lucide-react";
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

  const onPlayTrack = (index: number) => {
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
  };

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

  const onNextTrack = () => {
    const nextIndex = (currentTrackIndex + 1) % tracks.length;
    onPlayTrack(nextIndex);
  };

  const onPreviousTrack = () => {
    const prevIndex = (currentTrackIndex - 1 + tracks.length) % tracks.length;
    onPlayTrack(prevIndex);
  };

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
    <div className="w-full max-w-2xl overflow-hidden rounded-lg bg-card shadow-lg">
      <MediaPlayer
        onPlay={onPlay}
        onPause={onPause}
        onEnded={onEnded}
        className="[&_[data-slot=media-player-controls]]:bg-transparent [&_[data-slot=media-player-controls]]:px-0 [&_[data-slot=media-player-controls]]:pb-0 [&_[data-slot=media-player-controls]]:dark:bg-transparent"
      >
        <div className="flex flex-col sm:flex-row">
          <div className="flex flex-col items-center p-4 sm:w-1/3 sm:items-start">
            <img
              src={currentTrack.cover}
              alt={currentTrack.title}
              width={200}
              height={200}
              className="mb-4 aspect-square rounded-md object-cover"
            />
            <h2 className="font-semibold text-foreground text-xl">
              {currentTrack.title}
            </h2>
            <p className="text-muted-foreground text-sm">
              {currentTrack.artist}
            </p>
            <MediaPlayerControls className="mt-4 w-full p-0">
              <MediaPlayerSeek className="w-full [&_[data-slider]]:h-8" />
              <div className="mt-1 flex w-full items-center justify-between">
                <MediaPlayerTime variant="progress" className="text-xs" />
                <MediaPlayerTime variant="duration" className="text-xs" />
              </div>
              <div className="mt-2 flex w-full items-center justify-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onPreviousTrack}
                  aria-label="Previous track"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polygon points="19 20 9 12 19 4 19 20"></polygon>
                    <line x1="5" y1="19" x2="5" y2="5"></line>
                  </svg>
                </Button>
                <MediaPlayerPlay className="size-10" />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onNextTrack}
                  aria-label="Next track"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polygon points="5 4 15 12 5 20 5 4"></polygon>
                    <line x1="19" y1="5" x2="19" y2="19"></line>
                  </svg>
                </Button>
              </div>
              <div className="mt-2 flex w-full items-center gap-2">
                <MediaPlayerVolume className="flex-grow" />
              </div>
            </MediaPlayerControls>
          </div>

          <div className="border-border border-t sm:w-2/3 sm:border-t-0 sm:border-l">
            <div className="flex items-center justify-between border-border border-b p-4">
              <h3 className="flex items-center font-medium text-foreground text-lg">
                <ListMusicIcon className="mr-2 size-5" /> Playlist
              </h3>
              <span className="text-muted-foreground text-xs">{`${currentTrackIndex + 1} / ${tracks.length}`}</span>
            </div>
            <ScrollArea className="h-[360px] sm:h-[calc(200px+10rem)]">
              {" "}
              {/* Adjusted height */}
              <div className="divide-y divide-border">
                {tracks.map((track, index) => (
                  <button
                    key={track.id}
                    onClick={() => onTogglePlayPauseTrack(index)}
                    className={cn(
                      "flex w-full items-center p-3 text-left transition-colors duration-150 hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                      index === currentTrackIndex && "bg-muted",
                    )}
                  >
                    <img
                      src={track.cover}
                      alt={track.title}
                      width={40}
                      height={40}
                      className="mr-3 aspect-square rounded object-cover"
                    />
                    <div className="flex-1">
                      <p
                        className={cn(
                          "font-medium text-sm",
                          index === currentTrackIndex && "text-primary",
                        )}
                      >
                        {track.title}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        {track.artist}
                      </p>
                    </div>
                    {index === currentTrackIndex && isPlaying ? (
                      <PauseCircleIcon className="ml-3 size-5 text-primary" />
                    ) : index === currentTrackIndex && !isPlaying ? (
                      <PlayCircleIcon className="ml-3 size-5 text-muted-foreground" />
                    ) : (
                      <PlayCircleIcon className="ml-3 size-5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                    )}
                  </button>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>
        {/* Hidden Audio Element, we pass the ref to the MediaPlayerAudio */}
        <MediaPlayerAudio
          ref={audioRef}
          src={currentTrack.src}
          className="sr-only"
        />
      </MediaPlayer>
    </div>
  );
}
