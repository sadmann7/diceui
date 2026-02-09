import {
  QRCode,
  QRCodeCanvas,
  QRCodeSkeleton,
} from "@/registry/bases/radix/ui/qr-code";

export default function QRCodeDemo() {
  return (
    <QRCode value="https://diceui.com" size={200}>
      <QRCodeSkeleton />
      <QRCodeCanvas />
    </QRCode>
  );
}
