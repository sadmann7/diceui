"use client";

import {
  Axe,
  Crosshair,
  Flame,
  Shield,
  Snowflake,
  Sparkles,
  Sword,
  Wind,
  Zap,
} from "lucide-react";

import {
  SelectionWheel,
  SelectionWheelContent,
  SelectionWheelIndicator,
  SelectionWheelItem,
  SelectionWheelLabel,
  SelectionWheelSub,
  SelectionWheelSubContent,
  SelectionWheelSubTrigger,
} from "@/registry/bases/radix/ui/selection-wheel";

const weapons = [
  { value: "sword", label: "Sword", icon: Sword },
  { value: "axe", label: "Axe", icon: Axe },
  { value: "bow", label: "Bow", icon: Crosshair },
  { value: "shield", label: "Shield", icon: Shield },
];

const spells = [
  { value: "fire", label: "Fire", icon: Flame },
  { value: "ice", label: "Ice", icon: Snowflake },
  { value: "bolt", label: "Bolt", icon: Zap },
  { value: "wind", label: "Wind", icon: Wind },
];

export default function SelectionWheelNestedDemo() {
  return (
    <SelectionWheel defaultValue="ice">
      <SelectionWheelContent aria-label="Weapon">
        <SelectionWheelIndicator />
        {weapons.map((weapon) => (
          <SelectionWheelItem
            key={weapon.value}
            value={weapon.value}
            label={weapon.label}
          >
            <weapon.icon />
          </SelectionWheelItem>
        ))}
        <SelectionWheelSub>
          <SelectionWheelSubTrigger value="magic" label="Magic">
            <Sparkles />
          </SelectionWheelSubTrigger>
          <SelectionWheelSubContent>
            {spells.map((spell) => (
              <SelectionWheelItem
                key={spell.value}
                value={spell.value}
                label={spell.label}
              >
                <spell.icon />
              </SelectionWheelItem>
            ))}
          </SelectionWheelSubContent>
        </SelectionWheelSub>
        <SelectionWheelLabel />
      </SelectionWheelContent>
    </SelectionWheel>
  );
}
