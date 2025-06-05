import {
  MediaPlayer,
  MediaPlayerAudio,
  MediaPlayerControls,
  MediaPlayerLoop,
  MediaPlayerPlay,
  MediaPlayerPlaybackSpeed,
  MediaPlayerSeek,
  MediaPlayerSeekBackward,
  MediaPlayerSeekForward,
  MediaPlayerVolume,
} from "@/registry/default/ui/media-player";

export default function MediaPlayerAudioDemo() {
  return (
    <MediaPlayer className="h-20 bg-accent/70 backdrop-blur-sm">
      <MediaPlayerAudio className="sr-only">
        <source src="/assets/lofi.mp3" type="audio/mp3" />
      </MediaPlayerAudio>
      <MediaPlayerControls className="flex-col items-start gap-2.5">
        <MediaPlayerSeek tooltipSideOffset={18} />
        <div className="flex w-full items-center justify-center gap-2">
          <MediaPlayerSeekBackward />
          <MediaPlayerPlay />
          <MediaPlayerSeekForward />
          <MediaPlayerVolume />
          <MediaPlayerPlaybackSpeed />
          <MediaPlayerLoop />
        </div>
      </MediaPlayerControls>
    </MediaPlayer>
  );
}
