import * as Stack from "@/registry/default/ui/stack";

export default function StackNoExpandDemo() {
  return (
    <div className="flex min-h-[400px] items-center justify-center">
      <Stack.Root className="w-[360px]" expandOnHover={false}>
        <Stack.Item>
          <div className="space-y-2">
            <h3 className="font-semibold">Static Stack</h3>
            <p className="text-muted-foreground text-sm">
              This stack doesn't expand on hover
            </p>
          </div>
        </Stack.Item>
        <Stack.Item>
          <div className="space-y-2">
            <h3 className="font-semibold">Item 2</h3>
            <p className="text-muted-foreground text-sm">
              The stacking effect remains constant
            </p>
          </div>
        </Stack.Item>
        <Stack.Item>
          <div className="space-y-2">
            <h3 className="font-semibold">Item 3</h3>
            <p className="text-muted-foreground text-sm">
              Perfect for permanent visual hierarchy
            </p>
          </div>
        </Stack.Item>
      </Stack.Root>
    </div>
  );
}
