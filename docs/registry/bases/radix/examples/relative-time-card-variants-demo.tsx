import { Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RelativeTimeCard } from "@/registry/bases/radix/ui/relative-time-card";

export default function RelativeTimeCardVariantsDemo() {
  const now = new Date();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <span className="text-muted-foreground text-sm">Style variants</span>
        <div className="flex items-center gap-4">
          <RelativeTimeCard date={now} variant="default" />
          <RelativeTimeCard date={now} variant="muted" />
          <RelativeTimeCard date={now} variant="ghost" />
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <span className="text-muted-foreground text-sm">Custom styling</span>
        <div className="flex items-center gap-4">
          <RelativeTimeCard
            date={now}
            className="text-blue-500 hover:text-blue-700"
          />
          <RelativeTimeCard
            date={now}
            className="font-semibold text-green-600 hover:text-green-800"
          />
          <RelativeTimeCard
            date={now}
            className="text-purple-500 italic hover:text-purple-700"
          />
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <span className="text-muted-foreground text-sm">
          Hover card positions
        </span>
        <div className="flex items-center gap-4">
          <RelativeTimeCard date={now} side="top" align="start" sideOffset={10}>
            Top aligned
          </RelativeTimeCard>
          <RelativeTimeCard
            date={now}
            side="right"
            align="center"
            sideOffset={10}
          >
            Right aligned
          </RelativeTimeCard>
          <RelativeTimeCard
            date={now}
            side="bottom"
            align="end"
            sideOffset={10}
          >
            Bottom aligned
          </RelativeTimeCard>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <span className="text-muted-foreground text-sm">Custom trigger</span>
        <div className="flex items-center gap-4">
          <RelativeTimeCard date={now} asChild>
            <Button variant="outline" size="sm">
              <Clock />
              Time details
            </Button>
          </RelativeTimeCard>
          <RelativeTimeCard date={now}>
            <div className="flex items-center gap-2 text-emerald-600">
              <span className="i-lucide-calendar h-4 w-4" />
              <span>View date</span>
            </div>
          </RelativeTimeCard>
        </div>
      </div>
    </div>
  );
}
