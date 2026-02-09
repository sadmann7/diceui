import {
  ColorPicker,
  ColorPickerAlphaSlider,
  ColorPickerArea,
  ColorPickerContent,
  ColorPickerEyeDropper,
  ColorPickerFormatSelect,
  ColorPickerHueSlider,
  ColorPickerInput,
  ColorPickerSwatch,
  ColorPickerTrigger,
} from "@/registry/bases/radix/ui/color-picker";

export default function ColorPickerDemo() {
  return (
    <ColorPicker defaultFormat="hex" defaultValue="#3b82f6">
      <ColorPickerTrigger asChild>
        <ColorPickerSwatch />
      </ColorPickerTrigger>
      <ColorPickerContent>
        <ColorPickerArea />
        <div className="flex items-center gap-2">
          <ColorPickerEyeDropper />
          <div className="flex flex-1 flex-col gap-2">
            <ColorPickerHueSlider />
            <ColorPickerAlphaSlider />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ColorPickerFormatSelect />
          <ColorPickerInput />
        </div>
      </ColorPickerContent>
    </ColorPicker>
  );
}
