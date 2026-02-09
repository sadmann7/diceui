import { DollarSign, TrendingUp } from "lucide-react";
import {
  Stat,
  StatIndicator,
  StatLabel,
  StatTrend,
  StatValue,
} from "@/registry/bases/radix/ui/stat";

export default function StatVariantsDemo() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Stat>
        <StatLabel>Default Indicator</StatLabel>
        <StatValue>2,350</StatValue>
        <StatIndicator>
          <TrendingUp />
        </StatIndicator>
      </Stat>

      <Stat>
        <StatLabel>Icon Variant</StatLabel>
        <StatValue>$45,231</StatValue>
        <StatIndicator variant="icon" color="success">
          <DollarSign />
        </StatIndicator>
      </Stat>

      <Stat>
        <StatLabel>Badge Variant</StatLabel>
        <StatValue>1,234</StatValue>
        <StatIndicator variant="badge" color="info">
          +24
        </StatIndicator>
      </Stat>

      <Stat>
        <StatLabel>Warning Color</StatLabel>
        <StatValue>89%</StatValue>
        <StatIndicator variant="icon" color="warning">
          <TrendingUp />
        </StatIndicator>
        <StatTrend trend="down">Capacity threshold reached</StatTrend>
      </Stat>
    </div>
  );
}
