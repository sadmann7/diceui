import { Button } from "@/registry/bases/base/ui/button";
import {
  Faceted,
  FacetedClear,
  FacetedContent,
  FacetedEmpty,
  FacetedGroup,
  FacetedInput,
  FacetedItem,
  FacetedItemIndicator,
  FacetedList,
  FacetedTrigger,
  FacetedValue,
} from "@/registry/bases/base/ui/faceted";

const statuses = [
  { label: "Todo", value: "todo", count: 12 },
  { label: "In Progress", value: "in-progress", count: 5 },
  { label: "In Review", value: "in-review", count: 3 },
  { label: "Done", value: "done", count: 24 },
  { label: "Canceled", value: "canceled", count: 2 },
];

export default function FacetedMultipleDemo() {
  return (
    <Faceted items={statuses} multiple>
      <FacetedTrigger render={<Button variant="outline" className="w-48" />}>
        <FacetedValue placeholder="Filter status..." />
      </FacetedTrigger>
      <FacetedContent>
        <FacetedInput placeholder="Status" />
        <FacetedList>
          <FacetedEmpty>No status found.</FacetedEmpty>
          <FacetedGroup>
            {statuses.map((status) => (
              <FacetedItem key={status.value} value={status.value}>
                <span className="flex-1 truncate">{status.label}</span>
                <FacetedItemIndicator>{status.count}</FacetedItemIndicator>
              </FacetedItem>
            ))}
          </FacetedGroup>
          <FacetedClear>Clear filters</FacetedClear>
        </FacetedList>
      </FacetedContent>
    </Faceted>
  );
}
