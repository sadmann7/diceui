import {
  MediaPlayer,
  MediaPlayerAudio,
  MediaPlayerControls,
  MediaPlayerPlay,
  MediaPlayerPlaybackSpeed,
  MediaPlayerSeek,
  MediaPlayerSeekBackward,
  MediaPlayerSeekForward,
  MediaPlayerVolume,
} from "@/registry/default/ui/media-player";

export default function MediaPlayerAudioDemo() {
  return (
    <MediaPlayer className="h-20">
      <MediaPlayerAudio>
        <source src="/assets/lofi.mp3" type="audio/mp3" />
      </MediaPlayerAudio>
      <MediaPlayerControls className="flex-col items-start gap-2.5">
        <MediaPlayerSeek withTime />
        <div className="flex w-full items-center gap-2">
          <div className="flex flex-1 items-center gap-2">
            <MediaPlayerPlay />
            <MediaPlayerSeekBackward />
            <MediaPlayerSeekForward />
            <MediaPlayerVolume expandable />
          </div>
          <MediaPlayerPlaybackSpeed />
        </div>
      </MediaPlayerControls>
    </MediaPlayer>
  );
}
