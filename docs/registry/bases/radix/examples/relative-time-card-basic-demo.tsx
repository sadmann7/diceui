import { RelativeTimeCard } from "@/registry/bases/radix/ui/relative-time-card";

export default function RelativeTimeCardBasicDemo() {
  const now = new Date();
  const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  return (
    <div className="flex flex-col gap-4">
      <RelativeTimeCard date={fiveMinutesAgo} />
      <RelativeTimeCard date={oneHourAgo} />
      <RelativeTimeCard date={oneDayAgo} />
    </div>
  );
}
