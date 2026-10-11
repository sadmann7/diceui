import { Button } from "@/registry/bases/base/ui/button";
import {
  Faceted,
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

const frameworks = [
  { label: "Next.js", value: "next" },
  { label: "Remix", value: "remix" },
  { label: "Astro", value: "astro" },
  { label: "SvelteKit", value: "sveltekit" },
  { label: "Nuxt", value: "nuxt" },
];

export default function FacetedDemo() {
  return (
    <Faceted items={frameworks}>
      <FacetedTrigger render={<Button variant="outline" className="w-48" />}>
        <FacetedValue placeholder="Select framework..." />
      </FacetedTrigger>
      <FacetedContent>
        <FacetedInput placeholder="Search framework..." />
        <FacetedList>
          <FacetedEmpty>No framework found.</FacetedEmpty>
          <FacetedGroup>
            {frameworks.map((framework) => (
              <FacetedItem key={framework.value} value={framework.value}>
                {framework.label}
                <FacetedItemIndicator />
              </FacetedItem>
            ))}
          </FacetedGroup>
        </FacetedList>
      </FacetedContent>
    </Faceted>
  );
}
