import { Demo } from "@/components/demo";
import { Shell } from "@/components/shell";
import ColorPickerDemo from "@/registry/default/examples/color-picker-demo";
import QRCodeDemo from "@/registry/default/examples/qr-code-demo";
import QRCodeFormatsDemo from "@/registry/default/examples/qr-code-formats-demo";
import QRCodeOverlayDemo from "@/registry/default/examples/qr-code-overlay-demo";
import ScrollSpyControlledDemo from "@/registry/default/examples/scroll-spy-controlled-demo";
import ScrollSpyDemo from "@/registry/default/examples/scroll-spy-demo";
import ScrollSpyVerticalDemo from "@/registry/default/examples/scroll-spy-vertical-demo";

export default function PlaygroundPage() {
  return (
    <Shell>
      <Demo>
        <QRCodeDemo />
        <QRCodeFormatsDemo />
        <QRCodeOverlayDemo />
        <ScrollSpyDemo />
        <ScrollSpyControlledDemo />
        <ScrollSpyVerticalDemo />
        <ColorPickerDemo />
      </Demo>
    </Shell>
  );
}
