import { Stack, StackItem } from "@/registry/bases/radix/ui/stack";

export default function StackSideDemo() {
  return (
    <div className="grid grid-cols-2 gap-8">
      <Stack className="w-[300px]" expandOnHover side="top">
        <StackItem className="flex flex-col gap-2">
          <h3 className="font-semibold">Top Stack</h3>
          <p className="text-muted-foreground text-sm">
            Items stack toward the top
          </p>
        </StackItem>
        <StackItem className="flex flex-col gap-2">
          <h3 className="font-semibold">Item 2</h3>
          <p className="text-muted-foreground text-sm">Behind the first</p>
        </StackItem>
        <StackItem className="flex flex-col gap-2">
          <h3 className="font-semibold">Item 3</h3>
          <p className="text-muted-foreground text-sm">Behind the second</p>
        </StackItem>
      </Stack>
      <Stack className="w-[300px]" expandOnHover side="bottom">
        <StackItem className="flex flex-col gap-2">
          <h3 className="font-semibold">Bottom Stack</h3>
          <p className="text-muted-foreground text-sm">
            Items stack toward the bottom
          </p>
        </StackItem>
        <StackItem className="flex flex-col gap-2">
          <h3 className="font-semibold">Item 2</h3>
          <p className="text-muted-foreground text-sm">Behind the first</p>
        </StackItem>
        <StackItem className="flex flex-col gap-2">
          <h3 className="font-semibold">Item 3</h3>
          <p className="text-muted-foreground text-sm">Behind the second</p>
        </StackItem>
      </Stack>
    </div>
  );
}
