import { Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RelativeTimeCard } from "@/registry/bases/radix/ui/relative-time-card";

export default function RelativeTimeCardDemo() {
  const now = new Date();
  const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <span className="text-muted-foreground text-sm">Basic usage</span>
        <RelativeTimeCard date={fiveMinutesAgo} />
      </div>
      <div className="flex flex-col gap-2">
        <span className="text-muted-foreground text-sm">
          Different variants
        </span>
        <div className="flex items-center gap-4">
          <RelativeTimeCard date={oneHourAgo} variant="default" />
          <RelativeTimeCard date={oneHourAgo} variant="muted" />
          <RelativeTimeCard date={oneHourAgo} variant="ghost" />
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <span className="text-muted-foreground text-sm">
          With time in the future
        </span>
        <div className="flex items-center gap-4">
          <RelativeTimeCard date={tomorrow} />
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <span className="text-muted-foreground text-sm">
          Multiple timezones
        </span>
        <RelativeTimeCard
          date={oneDayAgo}
          timezones={["America/New_York", "Europe/London", "Asia/Tokyo"]}
        />
      </div>
      <div className="flex flex-col gap-2">
        <span className="text-muted-foreground text-sm">Custom trigger</span>
        <RelativeTimeCard date={now} asChild>
          <Button variant="outline" size="sm">
            <Clock />
            View time details
          </Button>
        </RelativeTimeCard>
      </div>
      <div className="flex flex-col gap-2">
        <span className="text-muted-foreground text-sm">
          Different positions
        </span>
        <div className="flex items-center gap-4">
          <RelativeTimeCard date={now} side="top" align="start">
            Top Start
          </RelativeTimeCard>
          <RelativeTimeCard date={now} side="right" align="center">
            Right Center
          </RelativeTimeCard>
          <RelativeTimeCard date={now} side="bottom" align="end">
            Bottom End
          </RelativeTimeCard>
        </div>
      </div>
    </div>
  );
}
