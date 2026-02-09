import { registry as baseRegistry } from "./bases/base/registry";
import { registry as radixRegistry } from "./bases/radix/registry";

// Export both registries for multi-base support
export const registries = {
  radix: radixRegistry,
  base: baseRegistry,
} as const;

export type RegistryBase = keyof typeof registries;

// Helper to get registry by base name
export function getRegistry(base: RegistryBase) {
  return registries[base];
}
