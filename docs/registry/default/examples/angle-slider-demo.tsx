import {
  AngleSlider,
  AngleSliderRange,
  AngleSliderThumb,
  AngleSliderTrack,
  AngleSliderValue,
} from "@/registry/default/ui/angle-slider";

export default function AngleSliderDemo() {
  return (
    <AngleSlider defaultValue={[180]} max={360} min={0} step={1} radius={80}>
      <AngleSliderTrack>
        <AngleSliderRange />
      </AngleSliderTrack>
      <AngleSliderThumb />
      <AngleSliderValue />
    </AngleSlider>
  );
}
