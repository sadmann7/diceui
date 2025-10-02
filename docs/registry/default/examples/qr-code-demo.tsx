import { QRCode, QRCodeCanvas } from "@/registry/default/ui/qr-code";

export default function QRCodeDemo() {
  return (
    <QRCode value="https://diceui.com" size={200}>
      <QRCodeCanvas />
    </QRCode>
  );
}
