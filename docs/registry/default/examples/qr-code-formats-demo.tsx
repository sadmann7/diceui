import { Button } from "@/components/ui/button";
import {
  QRCode,
  QRCodeCanvas,
  QRCodeDownload,
  QRCodeImage,
  QRCodeSvg,
} from "@/registry/default/ui/qr-code";

const value = "https://diceui.com";

export default function QRCodeFormatsDemo() {
  return (
    <div className="flex flex-col gap-8 p-6">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h3 className="font-semibold text-lg">Canvas Format</h3>
          <p className="text-muted-foreground text-sm">
            Rendered using HTML5 Canvas
          </p>
        </div>
        <QRCode value={value} size={150}>
          <QRCodeCanvas />
          <QRCodeDownload format="png" filename="qr-canvas" asChild>
            <Button className="w-full">Download PNG</Button>
          </QRCodeDownload>
        </QRCode>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h3 className="font-semibold text-lg">SVG Format</h3>
          <p className="text-muted-foreground text-sm">
            Rendered as scalable SVG
          </p>
        </div>
        <QRCode value={value} size={150}>
          <QRCodeSvg />
          <QRCodeDownload format="svg" filename="qr-svg" asChild>
            <Button className="w-full">Download SVG</Button>
          </QRCodeDownload>
        </QRCode>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h3 className="font-semibold text-lg">Image Format</h3>
          <p className="text-muted-foreground text-sm">
            Rendered as an image element
          </p>
        </div>
        <QRCode value={value} size={150}>
          <QRCodeImage alt="DiceUI QR Code" />
          <QRCodeDownload format="png" filename="qr-image" asChild>
            <Button className="w-full">Download PNG</Button>
          </QRCodeDownload>
        </QRCode>
      </div>
    </div>
  );
}
