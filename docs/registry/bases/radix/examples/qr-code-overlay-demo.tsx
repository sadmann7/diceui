import { Dice4 } from "lucide-react";
import {
  QRCode,
  QRCodeCanvas,
  QRCodeImage,
  QRCodeOverlay,
  QRCodeSkeleton,
  QRCodeSvg,
} from "@/registry/bases/radix/ui/qr-code";

export default function QRCodeOverlayDemo() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
      <div className="flex flex-col items-center gap-2">
        <QRCode
          value="https://diceui.com"
          size={120}
          level="H"
          className="gap-4"
        >
          <QRCodeSkeleton />
          <QRCodeCanvas />
          <QRCodeOverlay className="rounded-full border-2 border-white p-2">
            <Dice4 className="size-6" />
          </QRCodeOverlay>
        </QRCode>
        <p className="text-center text-muted-foreground text-sm">
          Canvas with Logo
        </p>
      </div>

      <div className="flex flex-col items-center gap-2">
        <QRCode
          value="https://diceui.com"
          size={120}
          level="H"
          className="gap-4"
        >
          <QRCodeSkeleton />
          <QRCodeSvg />
          <QRCodeOverlay className="rounded-full border-2 border-white bg-linear-to-br from-accent to-muted p-2">
            <Dice4 className="size-6" />
          </QRCodeOverlay>
        </QRCode>
        <p className="text-center text-muted-foreground text-sm">
          SVG with Logo
        </p>
      </div>

      <div className="flex flex-col items-center gap-2">
        <QRCode
          value="https://diceui.com"
          size={120}
          level="H"
          className="gap-4"
        >
          <QRCodeSkeleton />
          <QRCodeImage />
          <QRCodeOverlay className="rounded-full border-2 border-white p-1.5">
            <Dice4 className="size-6" />
          </QRCodeOverlay>
        </QRCode>
        <p className="text-center text-muted-foreground text-sm">
          Image with Logo
        </p>
      </div>
    </div>
  );
}
