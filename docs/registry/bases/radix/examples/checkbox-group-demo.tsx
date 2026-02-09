import * as CheckboxGroup from "@diceui/checkbox-group";
import { Check } from "lucide-react";

export default function CheckboxGroupDemo() {
  return (
    <CheckboxGroup.CheckboxGroupRoot className="peer flex flex-col gap-3.5">
      <CheckboxGroup.CheckboxGroupLabel className="text-sm text-zinc-600 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 dark:text-zinc-400">
        Select your favorite tricks
      </CheckboxGroup.CheckboxGroupLabel>
      <CheckboxGroup.CheckboxGroupList className="flex gap-3 data-[orientation=horizontal]:flex-row data-[orientation=vertical]:flex-col">
        <label className="flex w-fit select-none items-center gap-2 text-sm text-zinc-900 leading-none has-data-disabled:cursor-not-allowed has-data-invalid:text-red-500 has-data-disabled:opacity-50 dark:text-zinc-100 dark:has-data-invalid:text-red-400">
          <CheckboxGroup.CheckboxGroupItem
            value="kickflip"
            className="h-4 w-4 shrink-0 rounded-sm border border-zinc-600 shadow-sm focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-zinc-500 data-invalid:border-red-500 dark:border-zinc-400 dark:data-invalid:border-red-400 dark:focus-visible:ring-zinc-400 [&[data-state=checked]:not([data-invalid])]:bg-zinc-900 [&[data-state=checked]:not([data-invalid])]:text-zinc-50 dark:[&[data-state=checked]:not([data-invalid])]:bg-zinc-100 dark:[&[data-state=checked]:not([data-invalid])]:text-zinc-900 [&[data-state=checked][data-invalid]]:bg-red-500 [&[data-state=checked][data-invalid]]:text-white dark:[&[data-state=checked][data-invalid]]:bg-red-400 [&[data-state=unchecked][data-invalid]]:bg-transparent"
          >
            <CheckboxGroup.CheckboxGroupIndicator>
              <Check className="size-3.5" />
            </CheckboxGroup.CheckboxGroupIndicator>
          </CheckboxGroup.CheckboxGroupItem>
          Kickflip
        </label>
        <label className="flex w-fit select-none items-center gap-2 text-sm text-zinc-900 leading-none has-data-disabled:cursor-not-allowed has-data-invalid:text-red-500 has-data-disabled:opacity-50 dark:text-zinc-100 dark:has-data-invalid:text-red-400">
          <CheckboxGroup.CheckboxGroupItem
            value="heelflip"
            className="h-4 w-4 shrink-0 rounded-sm border border-zinc-600 shadow-sm focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-zinc-500 data-invalid:border-red-500 dark:border-zinc-400 dark:data-invalid:border-red-400 dark:focus-visible:ring-zinc-400 [&[data-state=checked]:not([data-invalid])]:bg-zinc-900 [&[data-state=checked]:not([data-invalid])]:text-zinc-50 dark:[&[data-state=checked]:not([data-invalid])]:bg-zinc-100 dark:[&[data-state=checked]:not([data-invalid])]:text-zinc-900 [&[data-state=checked][data-invalid]]:bg-red-500 [&[data-state=checked][data-invalid]]:text-white dark:[&[data-state=checked][data-invalid]]:bg-red-400 [&[data-state=unchecked][data-invalid]]:bg-transparent"
          >
            <CheckboxGroup.CheckboxGroupIndicator>
              <Check className="size-3.5" />
            </CheckboxGroup.CheckboxGroupIndicator>
          </CheckboxGroup.CheckboxGroupItem>
          Heelflip
        </label>
        <label className="flex w-fit select-none items-center gap-2 text-sm text-zinc-900 leading-none has-data-disabled:cursor-not-allowed has-data-invalid:text-red-500 has-data-disabled:opacity-50 dark:text-zinc-100 dark:has-data-invalid:text-red-400">
          <CheckboxGroup.CheckboxGroupItem
            value="tre-flip"
            className="h-4 w-4 shrink-0 rounded-sm border border-zinc-600 shadow-sm focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-zinc-500 data-invalid:border-red-500 dark:border-zinc-400 dark:data-invalid:border-red-400 dark:focus-visible:ring-zinc-400 [&[data-state=checked]:not([data-invalid])]:bg-zinc-900 [&[data-state=checked]:not([data-invalid])]:text-zinc-50 dark:[&[data-state=checked]:not([data-invalid])]:bg-zinc-100 dark:[&[data-state=checked]:not([data-invalid])]:text-zinc-900 [&[data-state=checked][data-invalid]]:bg-red-500 [&[data-state=checked][data-invalid]]:text-white dark:[&[data-state=checked][data-invalid]]:bg-red-400 [&[data-state=unchecked][data-invalid]]:bg-transparent"
          >
            <CheckboxGroup.CheckboxGroupIndicator>
              <Check className="size-3.5" />
            </CheckboxGroup.CheckboxGroupIndicator>
          </CheckboxGroup.CheckboxGroupItem>
          Tre Flip
        </label>
        <label className="flex w-fit select-none items-center gap-2 text-sm text-zinc-900 leading-none has-data-disabled:cursor-not-allowed has-data-invalid:text-red-500 has-data-disabled:opacity-50 dark:text-zinc-100 dark:has-data-invalid:text-red-400">
          <CheckboxGroup.CheckboxGroupItem
            value="540-flip"
            className="h-4 w-4 shrink-0 rounded-sm border border-zinc-600 shadow-sm focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-zinc-500 data-invalid:border-red-500 dark:border-zinc-400 dark:data-invalid:border-red-400 dark:focus-visible:ring-zinc-400 [&[data-state=checked]:not([data-invalid])]:bg-zinc-900 [&[data-state=checked]:not([data-invalid])]:text-zinc-50 dark:[&[data-state=checked]:not([data-invalid])]:bg-zinc-100 dark:[&[data-state=checked]:not([data-invalid])]:text-zinc-900 [&[data-state=checked][data-invalid]]:bg-red-500 [&[data-state=checked][data-invalid]]:text-white dark:[&[data-state=checked][data-invalid]]:bg-red-400 [&[data-state=unchecked][data-invalid]]:bg-transparent"
          >
            <CheckboxGroup.CheckboxGroupIndicator>
              <Check className="size-3.5" />
            </CheckboxGroup.CheckboxGroupIndicator>
          </CheckboxGroup.CheckboxGroupItem>
          540 Flip
        </label>
      </CheckboxGroup.CheckboxGroupList>
    </CheckboxGroup.CheckboxGroupRoot>
  );
}
