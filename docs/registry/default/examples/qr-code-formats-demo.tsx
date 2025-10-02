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
        <h3 className="font-semibold text-lg">Canvas Format</h3>
        <div className="flex items-center gap-4">
          <QRCode value={value} size={150}>
            <QRCodeCanvas />
          </QRCode>
          <div className="flex flex-col gap-2">
            <p className="text-muted-foreground text-sm">
              Rendered using HTML5 Canvas
            </p>
            <QRCode value={value}>
              <QRCodeDownload format="png" filename="qr-canvas">
                Download PNG
              </QRCodeDownload>
            </QRCode>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <h3 className="font-semibold text-lg">SVG Format</h3>
        <div className="flex items-center gap-4">
          <QRCode value={value} size={150}>
            <QRCodeSvg />
          </QRCode>
          <div className="flex flex-col gap-2">
            <p className="text-muted-foreground text-sm">
              Rendered as scalable SVG
            </p>
            <QRCode value={value}>
              <QRCodeDownload format="svg" filename="qr-svg">
                Download SVG
              </QRCodeDownload>
            </QRCode>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <h3 className="font-semibold text-lg">Image Format</h3>
        <div className="flex items-center gap-4">
          <QRCode value={value} size={150}>
            <QRCodeImage alt="DiceUI QR Code" />
          </QRCode>
          <div className="flex flex-col gap-2">
            <p className="text-muted-foreground text-sm">
              Rendered as an image element
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
