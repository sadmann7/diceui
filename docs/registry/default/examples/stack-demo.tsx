import * as Stack from "@/registry/default/ui/stack";

export default function StackDemo() {
  return (
    <div className="flex min-h-[400px] items-center justify-center">
      <Stack.Root className="w-[360px]">
        <Stack.Item>
          <div className="space-y-2">
            <h3 className="font-semibold">Notification 1</h3>
            <p className="text-muted-foreground text-sm">
              Your deployment was successful
            </p>
          </div>
        </Stack.Item>
        <Stack.Item>
          <div className="space-y-2">
            <h3 className="font-semibold">Notification 2</h3>
            <p className="text-muted-foreground text-sm">
              New message from John Doe
            </p>
          </div>
        </Stack.Item>
        <Stack.Item>
          <div className="space-y-2">
            <h3 className="font-semibold">Notification 3</h3>
            <p className="text-muted-foreground text-sm">
              Update available for your app
            </p>
          </div>
        </Stack.Item>
        <Stack.Item>
          <div className="space-y-2">
            <h3 className="font-semibold">Notification 4</h3>
            <p className="text-muted-foreground text-sm">
              Your profile was viewed 5 times
            </p>
          </div>
        </Stack.Item>
        <Stack.Item>
          <div className="space-y-2">
            <h3 className="font-semibold">Notification 5</h3>
            <p className="text-muted-foreground text-sm">
              Reminder: Meeting at 3 PM
            </p>
          </div>
        </Stack.Item>
      </Stack.Root>
    </div>
  );
}
