import {
  QRCode,
  QRCodeCanvas,
  QRCodeDownload,
  QRCodeImage,
  QRCodeSvg,
} from "@/registry/default/ui/qr-code";

export default function QRCodeFormatsDemo() {
  const qrValue = "https://diceui.com";

  return (
    <div className="space-y-8 p-6">
      {/* Canvas Format */}
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Canvas Format</h3>
        <div className="flex items-center space-x-4">
          <QRCode value={qrValue} size={150}>
            <QRCodeCanvas />
          </QRCode>
          <div className="space-y-2">
            <p className="text-muted-foreground text-sm">
              Rendered using HTML5 Canvas
            </p>
            <QRCode value={qrValue}>
              <QRCodeDownload format="png" filename="qr-canvas">
                Download PNG
              </QRCodeDownload>
            </QRCode>
          </div>
        </div>
      </div>

      {/* SVG Format */}
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">SVG Format</h3>
        <div className="flex items-center space-x-4">
          <QRCode value={qrValue} size={150}>
            <QRCodeSvg />
          </QRCode>
          <div className="space-y-2">
            <p className="text-muted-foreground text-sm">
              Rendered as scalable SVG
            </p>
            <QRCode value={qrValue}>
              <QRCodeDownload format="svg" filename="qr-svg">
                Download SVG
              </QRCodeDownload>
            </QRCode>
          </div>
        </div>
      </div>

      {/* Image Format */}
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Image Format</h3>
        <div className="flex items-center space-x-4">
          <QRCode value={qrValue} size={150}>
            <QRCodeImage alt="DiceUI QR Code" />
          </QRCode>
          <div className="space-y-2">
            <p className="text-muted-foreground text-sm">
              Rendered as an image element
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
