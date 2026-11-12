import { ColorSwatch } from "@/registry/bases/radix/ui/color-swatch";

const colors = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#3b82f6"];

export default function ColorSwatchSizesDemo() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium">Small (sm)</span>
        <div className="flex gap-2">
          {colors.map((color, index) => (
            <ColorSwatch key={index} color={color} size="sm" />
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium">Default</span>
        <div className="flex gap-2">
          {colors.map((color, index) => (
            <ColorSwatch key={index} color={color} size="default" />
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium">Large (lg)</span>
        <div className="flex gap-2">
          {colors.map((color, index) => (
            <ColorSwatch key={index} color={color} size="lg" />
          ))}
        </div>
      </div>
    </div>
  );
}
