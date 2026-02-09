import {
  QRCode,
  QRCodeCanvas,
  QRCodeSkeleton,
} from "@/registry/bases/radix/ui/qr-code";

export default function QRCodeCustomizationDemo() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
      <div className="flex flex-col items-center gap-2">
        <QRCode
          value="https://diceui.com"
          size={150}
          foregroundColor="#3b82f6"
          backgroundColor="#f1f5f9"
        >
          <QRCodeCanvas />
          <QRCodeSkeleton />
        </QRCode>
        <p className="text-muted-foreground text-sm">Custom Colors</p>
      </div>

      <div className="flex flex-col items-center gap-2">
        <QRCode
          value="https://diceui.com"
          size={150}
          level="H"
          foregroundColor="#dc2626"
        >
          <QRCodeCanvas />
          <QRCodeSkeleton />
        </QRCode>
        <p className="text-muted-foreground text-sm">High Error Correction</p>
      </div>
    </div>
  );
}
