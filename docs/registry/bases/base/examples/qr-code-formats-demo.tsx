import { Button } from "@/registry/bases/base/ui/button";
import {
  QRCode,
  QRCodeCanvas,
  QRCodeDownload,
  QRCodeImage,
  QRCodeSvg,
} from "@/registry/bases/base/ui/qr-code";

const value = "https://diceui.com";

export default function QRCodeFormatsDemo() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
      <div className="flex flex-col items-center gap-2">
        <QRCode value={value} size={120}>
          <QRCodeCanvas />
          <QRCodeDownload
            format="png"
            filename="qr-canvas"
            render={<Button size="sm" />}
          >
            Download PNG
          </QRCodeDownload>
        </QRCode>
        <p className="text-sm text-muted-foreground">Rendered as canvas</p>
      </div>

      <div className="flex flex-col items-center gap-2">
        <QRCode value={value} size={120}>
          <QRCodeSvg />
          <QRCodeDownload
            format="svg"
            filename="qr-svg"
            render={<Button size="sm" />}
          >
            Download SVG
          </QRCodeDownload>
        </QRCode>
        <p className="text-sm text-muted-foreground">Rendered as SVG</p>
      </div>

      <div className="flex flex-col items-center gap-2">
        <QRCode value={value} size={120}>
          <QRCodeImage alt="QR Code" />
          <QRCodeDownload
            format="png"
            filename="qr-image"
            render={<Button size="sm" />}
          >
            Download PNG
          </QRCodeDownload>
        </QRCode>
        <p className="text-sm text-muted-foreground">Rendered as image</p>
      </div>
    </div>
  );
}
