import { ColorSwatch } from "@/registry/bases/radix/ui/color-swatch";

export default function ColorSwatchDemo() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <ColorSwatch color="#3b82f6" />
        <span className="font-medium text-sm">Primary Blue</span>
      </div>
      <div className="flex items-center gap-3">
        <ColorSwatch color="#ef4444" size="sm" />
        <ColorSwatch color="#ef4444" size="default" />
        <ColorSwatch color="#ef4444" size="lg" />
        <span className="font-medium text-sm">Different Sizes</span>
      </div>
      <div className="flex items-center gap-3">
        <ColorSwatch color="rgba(59, 130, 246, 0.5)" />
        <span className="font-medium text-sm">Semi-transparent Blue</span>
      </div>
      <div className="flex items-center gap-3">
        <span className="font-medium text-sm">Color Palette</span>
        <div className="flex gap-2">
          <ColorSwatch color="#ef4444" />
          <ColorSwatch color="#f97316" />
          <ColorSwatch color="#eab308" />
          <ColorSwatch color="#22c55e" />
          <ColorSwatch color="#3b82f6" />
          <ColorSwatch color="#8b5cf6" />
          <ColorSwatch color="#ec4899" />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <ColorSwatch color="#ef4444" disabled />
        <span className="font-medium text-sm">Disabled</span>
      </div>
    </div>
  );
}
