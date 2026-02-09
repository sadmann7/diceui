import { RelativeTimeCard } from "@/registry/bases/radix/ui/relative-time-card";

export default function RelativeTimeCardTimezonesDemo() {
  const now = new Date();

  return (
    <div className="flex flex-col gap-4">
      <RelativeTimeCard
        date={now}
        timezones={[
          "America/Los_Angeles",
          "America/New_York",
          "Europe/London",
          "Asia/Singapore",
          "Asia/Tokyo",
        ]}
      />
      <RelativeTimeCard
        date={now}
        timezones={[
          "America/Chicago",
          "Europe/Paris",
          "Asia/Dubai",
          "Australia/Sydney",
        ]}
      />
      <RelativeTimeCard date={now} timezones={["UTC"]} />
    </div>
  );
}
