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
} from "@/registry/bases/radix/ui/media-player";

export default function MediaPlayerAudioDemo() {
  return (
    <MediaPlayer className="h-20">
      <MediaPlayerAudio className="sr-only">
        <source src="/assets/lofi.mp3" type="audio/mp3" />
      </MediaPlayerAudio>
      <MediaPlayerControls className="flex-col items-start gap-2.5">
        <MediaPlayerSeek withTime />
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
