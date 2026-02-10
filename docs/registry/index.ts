import { registry as baseRegistry } from "./bases/base/registry";
import { registry as radixRegistry } from "./bases/radix/registry";

export const registries = {
  radix: radixRegistry,
  base: baseRegistry,
} as const;

export type RegistryBase = keyof typeof registries;

export function getRegistry(base: RegistryBase) {
  return registries[base];
}
