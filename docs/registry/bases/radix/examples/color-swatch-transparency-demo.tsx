import { ColorSwatch } from "@/registry/bases/radix/ui/color-swatch";

export default function ColorSwatchTransparencyDemo() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <span className="font-medium text-sm">Alpha Transparency</span>
        <div className="flex gap-2">
          <ColorSwatch color="rgba(59, 130, 246, 1)" />
          <ColorSwatch color="rgba(59, 130, 246, 0.8)" />
          <ColorSwatch color="rgba(59, 130, 246, 0.6)" />
          <ColorSwatch color="rgba(59, 130, 246, 0.4)" />
          <ColorSwatch color="rgba(59, 130, 246, 0.2)" />
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <span className="font-medium text-sm">HSLA Colors</span>
        <div className="flex gap-2">
          <ColorSwatch color="hsla(220, 91%, 60%, 1)" />
          <ColorSwatch color="hsla(220, 91%, 60%, 0.75)" />
          <ColorSwatch color="hsla(220, 91%, 60%, 0.5)" />
          <ColorSwatch color="hsla(220, 91%, 60%, 0.25)" />
          <ColorSwatch color="hsla(220, 91%, 60%, 0.1)" />
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <span className="font-medium text-sm">
          Without Transparency Pattern
        </span>
        <div className="flex gap-2">
          <ColorSwatch color="rgba(239, 68, 68, 0.8)" withoutTransparency />
          <ColorSwatch color="rgba(34, 197, 94, 0.6)" withoutTransparency />
          <ColorSwatch color="rgba(139, 92, 246, 0.4)" withoutTransparency />
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <span className="font-medium text-sm">
          With Transparency Pattern (Default)
        </span>
        <div className="flex gap-2">
          <ColorSwatch color="rgba(239, 68, 68, 0.8)" />
          <ColorSwatch color="rgba(34, 197, 94, 0.6)" />
          <ColorSwatch color="rgba(139, 92, 246, 0.4)" />
        </div>
      </div>
    </div>
  );
}
