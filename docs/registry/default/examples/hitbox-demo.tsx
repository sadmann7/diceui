"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Hitbox } from "@/registry/default/ui/hitbox";

export default function HitboxDemo() {
  return (
    <div className="flex flex-col gap-2">
      <Hitbox>
        <Checkbox className="hover:border-primary/40" />
      </Hitbox>
    </div>
  );
}
