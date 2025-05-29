import {
  MediaPlayer,
  MediaPlayerAirPlay,
  MediaPlayerCaptions,
  MediaPlayerCast,
  MediaPlayerControls,
  MediaPlayerDownload,
  MediaPlayerFullscreen,
  MediaPlayerLive,
  MediaPlayerLoading,
  MediaPlayerLoop,
  MediaPlayerOverlay,
  MediaPlayerPiP,
  MediaPlayerPlay,
  MediaPlayerResolution,
  MediaPlayerSeek,
  MediaPlayerSeekBackward,
  MediaPlayerSeekForward,
  MediaPlayerSettings,
  MediaPlayerTime,
  MediaPlayerVideo,
  MediaPlayerVolume,
} from "@/registry/default/ui/media-player";

export default function MediaPlayerAdvancedDemo() {
  return (
    <MediaPlayer className="w-full max-w-4xl">
      <MediaPlayerVideo
        src="https://stream.mux.com/Sc89iWAyNkhJ3P1rQ02nrEdCFTnfT01CZ2KmaEcxXfB008.m3u8"
        poster="https://image.mux.com/Sc89iWAyNkhJ3P1rQ02nrEdCFTnfT01CZ2KmaEcxXfB008/thumbnail.webp?time=13"
        preload="metadata"
        muted={false}
        crossOrigin="anonymous"
        className="aspect-video"
      />
      <MediaPlayerOverlay />
      <MediaPlayerLoading />
      <MediaPlayerControls className="flex-col items-start gap-2.5">
        <MediaPlayerSeek className="w-full" />
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center gap-2">
            <MediaPlayerPlay />
            <MediaPlayerSeekBackward seconds={10} />
            <MediaPlayerSeekForward seconds={10} />
            <MediaPlayerVolume expandable />
            <MediaPlayerTime />
          </div>
          <div className="flex items-center gap-2">
            <MediaPlayerLive />
            <MediaPlayerLoop />
            <MediaPlayerCaptions />
            <MediaPlayerResolution />
            <MediaPlayerSettings />
            <MediaPlayerDownload />
            <MediaPlayerCast />
            <MediaPlayerAirPlay />
            <MediaPlayerPiP />
            <MediaPlayerFullscreen />
          </div>
        </div>
      </MediaPlayerControls>
    </MediaPlayer>
  );
}
