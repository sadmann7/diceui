import * as Stack from "@/registry/default/ui/stack";

export default function StackDemo() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <h3 className="font-medium text-sm">Basic Stack</h3>
        <Stack.Root spacing="md">
          <Stack.Item>
            <div className="size-8 rounded bg-blue-500" />
          </Stack.Item>
          <Stack.Item>
            <div className="size-8 rounded bg-green-500" />
          </Stack.Item>
          <Stack.Item>
            <div className="size-8 rounded bg-red-500" />
          </Stack.Item>
          <Stack.Item>
            <div className="size-8 rounded bg-yellow-500" />
          </Stack.Item>
        </Stack.Root>
      </div>
      <div className="flex flex-col gap-3">
        <h3 className="font-medium text-sm">Vertical Stack</h3>
        <Stack.Root direction="vertical" spacing="sm">
          <Stack.Item>
            <div className="h-6 w-20 rounded bg-purple-500" />
          </Stack.Item>
          <Stack.Item>
            <div className="h-6 w-16 rounded bg-pink-500" />
          </Stack.Item>
          <Stack.Item>
            <div className="h-6 w-24 rounded bg-indigo-500" />
          </Stack.Item>
        </Stack.Root>
      </div>
      <div className="flex flex-col gap-3">
        <h3 className="font-medium text-sm">Overlapping Stack</h3>
        <Stack.Root overlap spacing="sm">
          <Stack.Item>
            <div className="size-10 rounded-full border-2 border-background bg-blue-500" />
          </Stack.Item>
          <Stack.Item>
            <div className="size-10 rounded-full border-2 border-background bg-green-500" />
          </Stack.Item>
          <Stack.Item>
            <div className="size-10 rounded-full border-2 border-background bg-red-500" />
          </Stack.Item>
          <Stack.Item>
            <div className="size-10 rounded-full border-2 border-background bg-yellow-500" />
          </Stack.Item>
        </Stack.Root>
      </div>
    </div>
  );
}
