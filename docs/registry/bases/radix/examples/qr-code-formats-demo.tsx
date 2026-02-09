import { Button } from "@/components/ui/button";
import {
  QRCode,
  QRCodeCanvas,
  QRCodeDownload,
  QRCodeImage,
  QRCodeSvg,
} from "@/registry/bases/radix/ui/qr-code";

const value = "https://diceui.com";

export default function QRCodeFormatsDemo() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
      <div className="flex flex-col items-center gap-2">
        <QRCode value={value} size={120}>
          <QRCodeCanvas />
          <QRCodeDownload format="png" filename="qr-canvas" asChild>
            <Button size="sm">Download PNG</Button>
          </QRCodeDownload>
        </QRCode>
        <p className="text-muted-foreground text-sm">Rendered as canvas</p>
      </div>

      <div className="flex flex-col items-center gap-2">
        <QRCode value={value} size={120}>
          <QRCodeSvg />
          <QRCodeDownload format="svg" filename="qr-svg" asChild>
            <Button size="sm">Download SVG</Button>
          </QRCodeDownload>
        </QRCode>
        <p className="text-muted-foreground text-sm">Rendered as SVG</p>
      </div>

      <div className="flex flex-col items-center gap-2">
        <QRCode value={value} size={120}>
          <QRCodeImage alt="DiceUI QR Code" />
          <QRCodeDownload format="png" filename="qr-image" asChild>
            <Button size="sm">Download PNG</Button>
          </QRCodeDownload>
        </QRCode>
        <p className="text-muted-foreground text-sm">Rendered as image</p>
      </div>
    </div>
  );
}
