import * as CheckboxGroup from "@diceui/checkbox-group";

export default function CheckboxGroupDemo() {
  return (
    <CheckboxGroup.CheckboxGroupRoot className="peer flex flex-col gap-3.5">
      <label className="flex w-fit select-none items-center gap-2 text-sm text-zinc-900 leading-none has-data-disabled:cursor-not-allowed has-data-invalid:text-red-500 has-data-disabled:opacity-50 dark:text-zinc-100 dark:has-data-invalid:text-red-400">
        <CheckboxGroup.CheckboxGroupItem
          value="kickflip"
          className="h-4 w-4 shrink-0 rounded-sm border border-zinc-600 shadow-sm focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-zinc-500 data-invalid:border-red-500 dark:border-zinc-400 dark:data-invalid:border-red-400 dark:focus-visible:ring-zinc-400 [&[data-state=checked]:not([data-invalid])]:bg-zinc-900 [&[data-state=checked]:not([data-invalid])]:text-zinc-50 dark:[&[data-state=checked]:not([data-invalid])]:bg-zinc-100 dark:[&[data-state=checked]:not([data-invalid])]:text-zinc-900 [&[data-state=checked][data-invalid]]:bg-red-500 [&[data-state=checked][data-invalid]]:text-white dark:[&[data-state=checked][data-invalid]]:bg-red-400 [&[data-state=unchecked][data-invalid]]:bg-transparent"
        >
          <CheckboxGroup.CheckboxGroupIndicator
            className="size-3.5 animate-stroke-dashoffset [stroke-dasharray:100%_100%] motion-reduce:animate-none"
            asChild
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 12 9 17L20 6" />
            </svg>
          </CheckboxGroup.CheckboxGroupIndicator>
        </CheckboxGroup.CheckboxGroupItem>
        Kickflip
      </label>
      <label className="flex w-fit select-none items-center gap-2 text-sm text-zinc-900 leading-none has-data-disabled:cursor-not-allowed has-data-invalid:text-red-500 has-data-disabled:opacity-50 dark:text-zinc-100 dark:has-data-invalid:text-red-400">
        <CheckboxGroup.CheckboxGroupItem
          value="heelflip"
          className="h-4 w-4 shrink-0 rounded-sm border border-zinc-600 shadow-sm focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-zinc-500 data-invalid:border-red-500 dark:border-zinc-400 dark:data-invalid:border-red-400 dark:focus-visible:ring-zinc-400 [&[data-state=checked]:not([data-invalid])]:bg-zinc-900 [&[data-state=checked]:not([data-invalid])]:text-zinc-50 dark:[&[data-state=checked]:not([data-invalid])]:bg-zinc-100 dark:[&[data-state=checked]:not([data-invalid])]:text-zinc-900 [&[data-state=checked][data-invalid]]:bg-red-500 [&[data-state=checked][data-invalid]]:text-white dark:[&[data-state=checked][data-invalid]]:bg-red-400 [&[data-state=unchecked][data-invalid]]:bg-transparent"
        >
          <CheckboxGroup.CheckboxGroupIndicator
            className="size-3.5 animate-stroke-dashoffset [stroke-dasharray:100%_100%] motion-reduce:animate-none"
            asChild
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 12 9 17L20 6" />
            </svg>
          </CheckboxGroup.CheckboxGroupIndicator>
        </CheckboxGroup.CheckboxGroupItem>
        Heelflip
      </label>
    </CheckboxGroup.CheckboxGroupRoot>
  );
}
