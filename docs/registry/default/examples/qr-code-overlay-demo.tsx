import { Dice4 } from "lucide-react";
import {
  QRCode,
  QRCodeCanvas,
  QRCodeImage,
  QRCodeOverlay,
  QRCodeSvg,
} from "@/registry/default/ui/qr-code";

export default function QRCodeOverlayDemo() {
  return (
    <div className="flex flex-wrap items-start justify-center gap-8">
      <QRCode value="https://diceui.com" size={120} level="H" className="gap-4">
        <div className="relative">
          <QRCodeImage />
          <QRCodeOverlay className="rounded-md border-2 border-white p-1.5">
            <Dice4 className="size-6" />
          </QRCodeOverlay>
        </div>
        <p className="text-center text-muted-foreground text-sm">
          Image with Logo
        </p>
      </QRCode>

      <QRCode value="https://diceui.com" size={120} level="H" className="gap-4">
        <div className="relative">
          <QRCodeCanvas />
          <QRCodeOverlay className="rounded-full border-2 border-white bg-primary p-2">
            <Dice4 className="size-5 text-primary-foreground" />
          </QRCodeOverlay>
        </div>
        <p className="text-center text-muted-foreground text-sm">
          Canvas with Icon
        </p>
      </QRCode>

      <QRCode value="https://diceui.com" size={120} level="H" className="gap-4">
        <div className="relative">
          <QRCodeSvg />
          <QRCodeOverlay className="rounded-lg border-2 border-white bg-linear-to-br from-purple-500 to-pink-500 p-2">
            <Dice4 className="size-5 text-white" />
          </QRCodeOverlay>
        </div>
        <p className="text-center text-muted-foreground text-sm">
          SVG with Gradient
        </p>
      </QRCode>
    </div>
  );
}
