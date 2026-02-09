import { useAtom } from "jotai";
import { atomWithStorage } from "jotai/utils";

import type { RegistryBase } from "@/registry";
import type { Style } from "@/registry/styles";

interface Config {
  base: RegistryBase;
  style: Style["name"];
  theme: string;
  radius: number;
}

const configAtom = atomWithStorage<Config>("config", {
  base: "radix",
  style: "default",
  theme: "zinc",
  radius: 0.5,
});

export function useConfig() {
  return useAtom(configAtom);
}
