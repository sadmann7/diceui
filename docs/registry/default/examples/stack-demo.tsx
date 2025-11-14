import { Stack, StackItem } from "@/registry/default/ui/stack";

export default function StackDemo() {
  return (
    <div className="flex min-h-[400px] items-center justify-center">
      <Stack className="w-[360px]">
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
        <StackItem className="flex flex-col gap-2">
          <h3 className="font-semibold">Notification 4</h3>
          <p className="text-muted-foreground text-sm">
            Your profile was viewed 5 times
          </p>
        </StackItem>
      </Stack>
    </div>
  );
}
