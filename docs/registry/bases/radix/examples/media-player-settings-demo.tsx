import {
  MediaPlayer,
  MediaPlayerCaptions,
  MediaPlayerControls,
  MediaPlayerControlsOverlay,
  MediaPlayerError,
  MediaPlayerFullscreen,
  MediaPlayerLoading,
  MediaPlayerPiP,
  MediaPlayerPlay,
  MediaPlayerSeek,
  MediaPlayerSeekBackward,
  MediaPlayerSeekForward,
  MediaPlayerSettings,
  MediaPlayerTime,
  MediaPlayerVideo,
  MediaPlayerVolume,
  MediaPlayerVolumeIndicator,
} from "@/registry/bases/radix/ui/media-player";

export default function MediaPlayerSettingsDemo() {
  return (
    <MediaPlayer autoHide>
      <MediaPlayerVideo
        src="https://stream.mux.com/Sc89iWAyNkhJ3P1rQ02nrEdCFTnfT01CZ2KmaEcxXfB008/low.mp4"
        crossOrigin=""
        muted
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
        <track
          label="English"
          kind="captions"
          srcLang="en"
          src="https://media-chrome.mux.dev/examples/vanilla/vtt/elephantsdream/captions.en.vtt"
          default
        />
        <track
          label="Japanese"
          kind="captions"
          srcLang="ja"
          src="https://media-chrome.mux.dev/examples/vanilla/vtt/elephantsdream/captions.ja.vtt"
        />
        <track
          label="Swedish"
          kind="captions"
          srcLang="sv"
          src="https://media-chrome.mux.dev/examples/vanilla/vtt/elephantsdream/captions.sv.vtt"
        />
      </MediaPlayerVideo>
      <MediaPlayerLoading />
      <MediaPlayerError />
      <MediaPlayerVolumeIndicator />
      <MediaPlayerControls className="flex-col items-start gap-2.5">
        <MediaPlayerControlsOverlay />
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
            <MediaPlayerCaptions />
            <MediaPlayerSettings />
            <MediaPlayerPiP />
            <MediaPlayerFullscreen />
          </div>
        </div>
      </MediaPlayerControls>
    </MediaPlayer>
  );
}
