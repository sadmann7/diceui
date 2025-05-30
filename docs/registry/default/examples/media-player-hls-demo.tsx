import {
  MediaPlayer,
  MediaPlayerControls,
  MediaPlayerFullscreen,
  MediaPlayerLoading,
  MediaPlayerOverlay,
  MediaPlayerPlay,
  MediaPlayerResolution,
  MediaPlayerSeek,
  MediaPlayerSettings,
  MediaPlayerTime,
  MediaPlayerVideo,
  MediaPlayerVolume,
} from "@/registry/default/ui/media-player";

export default function MediaPlayerHlsDemo() {
  return (
    <MediaPlayer className="w-full max-w-4xl">
      <MediaPlayerVideo
        src="https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8"
        className="aspect-video"
      />
      <MediaPlayerOverlay />
      <MediaPlayerLoading className="bg-black/60" loadingDelay={200}>
        <div className="flex flex-col items-center gap-4">
          <div className="h-16 w-16 animate-spin rounded-full border-primary border-b-2"></div>
          <p className="font-semibold text-lg text-white">
            Loading HLS Stream...
          </p>
          <p className="text-sm text-white/70">Detecting video qualities</p>
        </div>
      </MediaPlayerLoading>
      <MediaPlayerControls className="flex-col items-start gap-2.5">
        <MediaPlayerSeek withTime className="w-full" />
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center gap-2">
            <MediaPlayerPlay />
            <MediaPlayerVolume expandable />
            <MediaPlayerTime mode="remaining" />
          </div>
          <div className="flex items-center gap-2">
            <MediaPlayerResolution />
            <MediaPlayerSettings />
            <MediaPlayerFullscreen />
          </div>
        </div>
      </MediaPlayerControls>
    </MediaPlayer>
  );
}
