import {
  MediaPlayer,
  MediaPlayerControls,
  MediaPlayerFullscreen,
  MediaPlayerOverlay,
  MediaPlayerPiP,
  MediaPlayerPlay,
  MediaPlayerSeek,
  MediaPlayerSeekBackward,
  MediaPlayerSeekForward,
  MediaPlayerSettings,
  MediaPlayerTime,
  MediaPlayerVideo,
  MediaPlayerVolume,
} from "@/registry/default/ui/media-player";

export default function MediaPlayerChaptersDemo() {
  return (
    <MediaPlayer>
      <MediaPlayerVideo
        slot="media"
        src="https://stream.mux.com/Sc89iWAyNkhJ3P1rQ02nrEdCFTnfT01CZ2KmaEcxXfB008/low.mp4"
        crossOrigin=""
        playsInline
      >
        <track
          default
          kind="chapters"
          src="https://media-chrome.mux.dev/examples/vanilla/vtt/elephantsdream/chapters.vtt"
        />
        <track
          default
          kind="metadata"
          label="thumbnails"
          src="https://image.mux.com/Sc89iWAyNkhJ3P1rQ02nrEdCFTnfT01CZ2KmaEcxXfB008/storyboard.vtt"
        />
      </MediaPlayerVideo>
      <MediaPlayerControls className="flex-col items-start gap-2.5">
        <MediaPlayerOverlay />
        <MediaPlayerSeek />
        <div className="flex w-full items-center gap-2">
          <div className="flex flex-1 items-center gap-2">
            <MediaPlayerPlay />
            <MediaPlayerSeekBackward />
            <MediaPlayerSeekForward />
            <MediaPlayerVolume expandable />
            <MediaPlayerTime />
          </div>
          <div className="flex items-center gap-2">
            <MediaPlayerSettings />
            <MediaPlayerPiP />
            <MediaPlayerFullscreen />
          </div>
        </div>
      </MediaPlayerControls>
    </MediaPlayer>
  );
}
