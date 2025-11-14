import { Stack, StackItem } from "@/registry/default/ui/stack";

export default function StackCustomDemo() {
  return (
    <div className="flex min-h-[400px] items-center justify-center">
      <Stack
        className="w-[360px]"
        visibleItems={4}
        gap={12}
        offset={15}
        scaleFactor={0.03}
      >
        <StackItem className="flex flex-col gap-2 bg-blue-50 dark:bg-blue-950">
          <h3 className="font-semibold text-blue-900 dark:text-blue-100">
            Info
          </h3>
          <p className="text-blue-700 text-sm dark:text-blue-300">
            System update in progress
          </p>
        </StackItem>
        <StackItem className="flex flex-col gap-2 bg-green-50 dark:bg-green-950">
          <h3 className="font-semibold text-green-900 dark:text-green-100">
            Success
          </h3>
          <p className="text-green-700 text-sm dark:text-green-300">
            Changes saved successfully
          </p>
        </StackItem>
        <StackItem className="flex flex-col gap-2 bg-yellow-50 dark:bg-yellow-950">
          <h3 className="font-semibold text-yellow-900 dark:text-yellow-100">
            Warning
          </h3>
          <p className="text-sm text-yellow-700 dark:text-yellow-300">
            Storage is running low
          </p>
        </StackItem>
        <StackItem className="flex flex-col gap-2 bg-red-50 dark:bg-red-950">
          <h3 className="font-semibold text-red-900 dark:text-red-100">
            Error
          </h3>
          <p className="text-red-700 text-sm dark:text-red-300">
            Failed to connect to server
          </p>
        </StackItem>
        <StackItem className="flex flex-col gap-2 bg-purple-50 dark:bg-purple-950">
          <h3 className="font-semibold text-purple-900 dark:text-purple-100">
            Update
          </h3>
          <p className="text-purple-700 text-sm dark:text-purple-300">
            New features available
          </p>
        </StackItem>
      </Stack>
    </div>
  );
}
