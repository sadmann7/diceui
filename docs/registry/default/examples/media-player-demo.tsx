import {
  MediaPlayer,
  MediaPlayerCaptions,
  MediaPlayerControls,
  MediaPlayerDownload,
  MediaPlayerFullscreen,
  MediaPlayerOverlay,
  MediaPlayerPiP,
  MediaPlayerPlay,
  MediaPlayerPlaybackSpeed,
  MediaPlayerSeek,
  MediaPlayerSeekBackward,
  MediaPlayerSeekForward,
  MediaPlayerTime,
  MediaPlayerVideo,
  MediaPlayerVolume,
} from "@/registry/default/ui/media-player";
import * as React from "react";

const VIDEO_URL =
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";
const CAPTIONS_URL =
  "https://gist.githubusercontent.com/samdutton/ca37f3adaf4e23679957b8083e061177/raw/e19399fbccbc069a2af4266e5120ae6bad62699a/sample.vtt";

export default function MediaPlayerDemo() {
  return (
    <MediaPlayer
      className="w-full max-w-2xl overflow-hidden rounded-lg"
      label="Big Buck Bunny Video Player"
      defaultPlaying
      defaultMuted
    >
      <MediaPlayerVideo>
        <source src={VIDEO_URL} type="video/mp4" />
        <track
          src={CAPTIONS_URL}
          kind="subtitles"
          srcLang="en"
          label="English"
          default
        />
      </MediaPlayerVideo>
      <MediaPlayerOverlay />
      <MediaPlayerControls className="gap-1.5">
        <MediaPlayerPlay />
        <MediaPlayerSeekBackward />
        <MediaPlayerSeekForward />
        <MediaPlayerVolume expandable />
        <MediaPlayerSeek withTime className="flex-1" />
        <MediaPlayerTime variant="remaining" />
        <MediaPlayerPlaybackSpeed />
        <MediaPlayerCaptions />
        <MediaPlayerPiP />
        <MediaPlayerFullscreen />
        <MediaPlayerDownload />
      </MediaPlayerControls>
    </MediaPlayer>
  );
}
