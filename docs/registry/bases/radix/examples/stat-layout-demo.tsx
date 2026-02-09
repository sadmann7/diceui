import { ArrowUp, Users } from "lucide-react";
import {
  Stat,
  StatDescription,
  StatIndicator,
  StatLabel,
  StatSeparator,
  StatTrend,
  StatValue,
} from "@/registry/bases/radix/ui/stat";

export default function StatLayoutDemo() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Stat>
        <StatLabel>Active Subscribers</StatLabel>
        <StatValue>2,847</StatValue>
        <StatIndicator variant="icon" color="success">
          <Users />
        </StatIndicator>
        <StatDescription>
          Total number of active subscribers as of today
        </StatDescription>
      </Stat>

      <Stat>
        <StatLabel>Monthly Revenue</StatLabel>
        <StatValue>$12,450</StatValue>
        <StatIndicator variant="icon" color="info">
          <ArrowUp />
        </StatIndicator>
        <StatSeparator />
        <StatTrend trend="up">
          <ArrowUp />
          +15.3% from last month
        </StatTrend>
        <StatDescription>
          Revenue generated in the current billing period
        </StatDescription>
      </Stat>
    </div>
  );
}
