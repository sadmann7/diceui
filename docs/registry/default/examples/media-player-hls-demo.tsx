import {
  MediaPlayer,
  MediaPlayerCaptions,
  MediaPlayerControls,
  MediaPlayerFullscreen,
  MediaPlayerLoading,
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
  MediaPlayerVolumeIndicator,
} from "@/registry/default/ui/media-player";
import MuxVideo from "@mux/mux-video-react";

export default function MediaPlayerHlsDemo() {
  return (
    <MediaPlayer autoHide>
      <MediaPlayerVideo asChild>
        <MuxVideo playbackId="A3VXy02VoUinw01pwyomEO3bHnG4P32xzV7u1j1FSzjNg" />
      </MediaPlayerVideo>
      <MediaPlayerLoading />
      <MediaPlayerVolumeIndicator />
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
