import { ColorSwatch } from "@/registry/bases/radix/ui/color-swatch";

const colors = [
  "#ef4444", // red
  "#f97316", // orange
  "#eab308", // yellow
  "#22c55e", // green
  "#3b82f6", // blue
];

export default function ColorSwatchSizesDemo() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <span className="font-medium text-sm">Small (sm)</span>
        <div className="flex gap-2">
          {colors.map((color, index) => (
            <ColorSwatch key={index} color={color} size="sm" />
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <span className="font-medium text-sm">Default</span>
        <div className="flex gap-2">
          {colors.map((color, index) => (
            <ColorSwatch key={index} color={color} size="default" />
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <span className="font-medium text-sm">Large (lg)</span>
        <div className="flex gap-2">
          {colors.map((color, index) => (
            <ColorSwatch key={index} color={color} size="lg" />
          ))}
        </div>
      </div>
    </div>
  );
}
