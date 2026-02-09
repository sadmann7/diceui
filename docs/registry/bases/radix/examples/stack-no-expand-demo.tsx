import { Stack, StackItem } from "@/registry/bases/radix/ui/stack";

export default function StackNoExpandDemo() {
  return (
    <div className="flex min-h-[400px] items-center justify-center">
      <Stack expandOnHover={false} className="w-[360px]">
        <StackItem className="flex flex-col gap-2">
          <h3 className="font-semibold">Static Stack</h3>
          <p className="text-muted-foreground text-sm">
            This stack doesn't expand on hover
          </p>
        </StackItem>
        <StackItem className="flex flex-col gap-2">
          <h3 className="font-semibold">Item 2</h3>
          <p className="text-muted-foreground text-sm">
            The stacking effect remains constant
          </p>
        </StackItem>
        <StackItem className="flex flex-col gap-2">
          <h3 className="font-semibold">Item 3</h3>
          <p className="text-muted-foreground text-sm">
            Perfect for permanent visual hierarchy
          </p>
        </StackItem>
      </Stack>
    </div>
  );
}
