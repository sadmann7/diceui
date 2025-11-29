import {
  ArrowDown,
  ArrowUp,
  DollarSign,
  ShoppingCart,
  Users,
} from "lucide-react";
import {
  Stat,
  StatChange,
  StatIcon,
  StatLabel,
  StatValue,
} from "@/registry/default/ui/stat";

export default function StatDemo() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Stat>
        <StatLabel>Total Revenue</StatLabel>
        <StatValue>$45,231</StatValue>
        <StatIcon variant="box" color="primary">
          <DollarSign />
        </StatIcon>
        <StatChange trend="up">
          <ArrowUp />
          +20.1% from last month
        </StatChange>
      </Stat>

      <Stat>
        <StatLabel>Active Users</StatLabel>
        <StatValue>2,350</StatValue>
        <StatIcon variant="box" color="blue">
          <Users />
        </StatIcon>
        <StatChange trend="up">
          <ArrowUp />
          +180 from last week
        </StatChange>
      </Stat>

      <Stat>
        <StatLabel>Total Orders</StatLabel>
        <StatValue>1,234</StatValue>
        <StatIcon variant="box" color="orange">
          <ShoppingCart />
        </StatIcon>
        <StatChange trend="down">
          <ArrowDown />
          -4.3% from last month
        </StatChange>
      </Stat>

      <Stat>
        <StatLabel>Conversion Rate</StatLabel>
        <StatValue>3.2%</StatValue>
        <StatIcon variant="box" color="green">
          <ArrowUp />
        </StatIcon>
        <StatChange trend="neutral">No change from last week</StatChange>
      </Stat>
    </div>
  );
}
