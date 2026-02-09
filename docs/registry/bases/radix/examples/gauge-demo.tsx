import {
  Gauge,
  GaugeIndicator,
  GaugeLabel,
  GaugeRange,
  GaugeTrack,
  GaugeValueText,
} from "@/registry/bases/radix/ui/gauge";

export default function GaugeDemo() {
  return (
    <Gauge value={85} size={180} thickness={12}>
      <GaugeIndicator>
        <GaugeTrack />
        <GaugeRange />
      </GaugeIndicator>
      <GaugeValueText />
      <GaugeLabel className="sr-only">Performance</GaugeLabel>
    </Gauge>
  );
}
