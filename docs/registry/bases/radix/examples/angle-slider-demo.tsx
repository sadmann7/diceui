import {
  AngleSlider,
  AngleSliderRange,
  AngleSliderThumb,
  AngleSliderTrack,
  AngleSliderValue,
} from "@/registry/bases/radix/ui/angle-slider";

export default function AngleSliderDemo() {
  return (
    <AngleSlider defaultValue={[180]} max={360} min={0} step={1}>
      <AngleSliderTrack>
        <AngleSliderRange />
      </AngleSliderTrack>
      <AngleSliderThumb />
      <AngleSliderValue />
    </AngleSlider>
  );
}
