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

export default function MediaPlayerSettingsDemo() {
  return (
    <MediaPlayer>
      <MediaPlayerVideo
        src="https://stream.mux.com/DS00Spx1CV902MCtPj5WknGlR102V5HFkDe/high.mp4"
        preload="auto"
        crossOrigin=""
        playsInline
        className="aspect-video"
      >
        <track
          label="thumbnails"
          default
          kind="metadata"
          src="https://image.mux.com/DS00Spx1CV902MCtPj5WknGlR102V5HFkDe/storyboard.vtt"
        />
        <track
          label="English"
          kind="captions"
          srcLang="en"
          src="/assets/en-cc.vtt"
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
