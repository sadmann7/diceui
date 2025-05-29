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
        src="https://d2zihajmogu5jn.cloudfront.net/elephantsdream/ed_hd.mp4"
        preload="metadata"
        crossOrigin=""
      >
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
        <track
          label="Russian"
          kind="captions"
          srcLang="ru"
          src="https://media-chrome.mux.dev/examples/vanilla/vtt/elephantsdream/captions.ru.vtt"
        />
        <track
          label="Arabic"
          kind="captions"
          srcLang="ar"
          src="https://media-chrome.mux.dev/examples/vanilla/vtt/elephantsdream/captions.ar.vtt"
        />
        <track
          label="Subs English"
          kind="subtitles"
          srcLang="en"
          src="https://media-chrome.mux.dev/examples/vanilla/vtt/elephantsdream/captions.en.vtt"
          default
        />
        <track
          label="Subs Japanese"
          kind="subtitles"
          srcLang="ja"
          src="https://media-chrome.mux.dev/examples/vanilla/vtt/elephantsdream/captions.ja.vtt"
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
