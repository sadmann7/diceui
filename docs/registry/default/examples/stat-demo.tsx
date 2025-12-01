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
  StatAccessory,
  StatChange,
  StatLabel,
  StatValue,
} from "@/registry/default/ui/stat";

export default function StatDemo() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Stat>
        <StatLabel>Total Revenue</StatLabel>
        <StatValue>$45,231</StatValue>
        <StatAccessory variant="icon" color="success">
          <DollarSign />
        </StatAccessory>
        <StatChange trend="up">
          <ArrowUp />
          +20.1% from last month
        </StatChange>
      </Stat>

      <Stat>
        <StatLabel>Active Users</StatLabel>
        <StatValue>2,350</StatValue>
        <StatAccessory variant="badge" color="info">
          +24
        </StatAccessory>
        <StatChange trend="up">
          <ArrowUp />
          +180 from last week
        </StatChange>
      </Stat>

      <Stat>
        <StatLabel>Total Orders</StatLabel>
        <StatValue>1,234</StatValue>
        <StatAccessory variant="icon" color="warning">
          <ShoppingCart />
        </StatAccessory>
        <StatChange trend="down">
          <ArrowDown />
          -4.3% from last month
        </StatChange>
      </Stat>

      <Stat>
        <StatLabel>Conversion Rate</StatLabel>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <StatAccessory variant="action">
              <MoreHorizontal />
            </StatAccessory>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>View details</DropdownMenuItem>
            <DropdownMenuItem>Export data</DropdownMenuItem>
            <DropdownMenuItem>Share</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <StatValue>3.2%</StatValue>
        <StatChange trend="neutral">No change from last week</StatChange>
      </Stat>
    </div>
  );
}
