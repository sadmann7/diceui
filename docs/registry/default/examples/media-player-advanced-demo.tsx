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
  MediaPlayerPlaybackSpeed,
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
        src="/assets/cloud.mp4"
        poster="/assets/cloud-poster.jpg"
        className="aspect-video"
      >
        <source src="/assets/cloud.mp4" type="video/mp4" />
        <track
          kind="subtitles"
          src="/assets/subtitles-en.vtt"
          srcLang="en"
          label="English"
          default
        />
      </MediaPlayerVideo>
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
            <MediaPlayerPlaybackSpeed speeds={[0.5, 0.75, 1, 1.25, 1.5, 2]} />
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
