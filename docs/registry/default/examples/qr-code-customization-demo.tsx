import { QRCode, QRCodeCanvas } from "@/registry/default/ui/qr-code";

export default function QRCodeCustomizationDemo() {
  return (
    <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-3">
      {/* Default QR Code */}
      <div className="flex flex-col items-center space-y-2">
        <QRCode value="https://diceui.com" size={150}>
          <QRCodeCanvas />
        </QRCode>
        <p className="text-muted-foreground text-sm">Default</p>
      </div>

      {/* Custom Colors */}
      <div className="flex flex-col items-center space-y-2">
        <QRCode
          value="https://diceui.com"
          size={150}
          fgColor="#3b82f6"
          bgColor="#f1f5f9"
        >
          <QRCodeCanvas />
        </QRCode>
        <p className="text-muted-foreground text-sm">Custom Colors</p>
      </div>

      {/* High Error Correction */}
      <div className="flex flex-col items-center space-y-2">
        <QRCode
          value="https://diceui.com"
          size={150}
          level="H"
          fgColor="#dc2626"
        >
          <QRCodeCanvas />
        </QRCode>
        <p className="text-muted-foreground text-sm">High Error Correction</p>
      </div>
    </div>
  );
}
