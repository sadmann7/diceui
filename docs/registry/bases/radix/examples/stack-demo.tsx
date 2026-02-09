import { Stack, StackItem } from "@/registry/bases/radix/ui/stack";

export default function StackDemo() {
  return (
    <Stack className="w-[360px]" expandOnHover>
      <StackItem className="flex flex-col gap-2">
        <h3 className="font-semibold">Notification 1</h3>
        <p className="text-muted-foreground text-sm">
          Your deployment was successful
        </p>
      </StackItem>
      <StackItem className="flex flex-col gap-2">
        <h3 className="font-semibold">Notification 2</h3>
        <p className="text-muted-foreground text-sm">
          New message from John Doe
        </p>
      </StackItem>
      <StackItem className="flex flex-col gap-2">
        <h3 className="font-semibold">Notification 3</h3>
        <p className="text-muted-foreground text-sm">
          Update available for your app
        </p>
      </StackItem>
    </Stack>
  );
}
