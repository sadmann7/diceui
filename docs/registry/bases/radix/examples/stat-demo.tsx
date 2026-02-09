import {
  ArrowDown,
  ArrowUp,
  DollarSign,
  MoreHorizontal,
  ShoppingCart,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Stat,
  StatIndicator,
  StatLabel,
  StatTrend,
  StatValue,
} from "@/registry/bases/radix/ui/stat";

export default function StatDemo() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Stat>
        <StatLabel>Total Revenue</StatLabel>
        <StatIndicator variant="icon" color="success">
          <DollarSign />
        </StatIndicator>
        <StatValue>$45,231</StatValue>
        <StatTrend trend="up">
          <ArrowUp />
          +20.1% from last month
        </StatTrend>
      </Stat>

      <Stat>
        <StatLabel>Active Users</StatLabel>
        <StatIndicator variant="badge" color="info">
          +24
        </StatIndicator>
        <StatValue>2,350</StatValue>
        <StatTrend trend="up">
          <ArrowUp />
          +180 from last week
        </StatTrend>
      </Stat>

      <Stat>
        <StatLabel>Total Orders</StatLabel>
        <StatIndicator variant="icon" color="warning">
          <ShoppingCart />
        </StatIndicator>
        <StatValue>1,234</StatValue>
        <StatTrend trend="down">
          <ArrowDown />
          -4.3% from last month
        </StatTrend>
      </Stat>

      <Stat>
        <StatLabel>Conversion Rate</StatLabel>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <StatIndicator variant="action">
              <MoreHorizontal />
            </StatIndicator>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>View details</DropdownMenuItem>
            <DropdownMenuItem>Export data</DropdownMenuItem>
            <DropdownMenuItem>Share</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <StatValue>3.2%</StatValue>
        <StatTrend trend="neutral">No change from last week</StatTrend>
      </Stat>
    </div>
  );
}
