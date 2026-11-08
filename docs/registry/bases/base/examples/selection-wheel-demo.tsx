"use client";

import {
  Axe,
  Bomb,
  Crosshair,
  Flame,
  Hammer,
  Shield,
  Sword,
  WandSparkles,
} from "lucide-react";

import {
  SelectionWheel,
  SelectionWheelContent,
  SelectionWheelIndicator,
  SelectionWheelItem,
  SelectionWheelLabel,
} from "@/registry/bases/base/ui/selection-wheel";

const weapons = [
  { value: "sword", label: "Sword", icon: Sword },
  { value: "axe", label: "Axe", icon: Axe },
  { value: "bow", label: "Bow", icon: Crosshair },
  { value: "bomb", label: "Bomb", icon: Bomb },
  { value: "shield", label: "Shield", icon: Shield },
  { value: "wand", label: "Wand", icon: WandSparkles },
  { value: "hammer", label: "Hammer", icon: Hammer },
  { value: "torch", label: "Torch", icon: Flame, disabled: true },
];

export default function SelectionWheelDemo() {
  return (
    <SelectionWheel defaultValue="sword">
      <SelectionWheelContent aria-label="Weapon">
        <SelectionWheelIndicator />
        {weapons.map((weapon) => (
          <SelectionWheelItem
            key={weapon.value}
            value={weapon.value}
            label={weapon.label}
            disabled={weapon.disabled}
          >
            <weapon.icon />
          </SelectionWheelItem>
        ))}
        <SelectionWheelLabel />
      </SelectionWheelContent>
    </SelectionWheel>
  );
}
