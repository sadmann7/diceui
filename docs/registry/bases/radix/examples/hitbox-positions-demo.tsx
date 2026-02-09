import { Checkbox } from "@/components/ui/checkbox";
import { Hitbox } from "@/registry/bases/radix/components/hitbox";

export default function HitboxPositionsDemo() {
  return (
    <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
      <div className="flex flex-col items-center gap-4">
        <Hitbox debug>
          <Checkbox />
        </Hitbox>
        <p className="text-muted-foreground text-sm">all</p>
      </div>
      <div className="flex flex-col items-center gap-4">
        <Hitbox position="top" debug>
          <Checkbox />
        </Hitbox>
        <p className="text-muted-foreground text-sm">top</p>
      </div>
      <div className="flex flex-col items-center gap-4">
        <Hitbox position="bottom" debug>
          <Checkbox />
        </Hitbox>
        <p className="text-muted-foreground text-sm">bottom</p>
      </div>
      <div className="flex flex-col items-center gap-4">
        <Hitbox position="left" debug>
          <Checkbox />
        </Hitbox>
        <p className="text-muted-foreground text-sm">left</p>
      </div>
      <div className="flex flex-col items-center gap-4">
        <Hitbox position="right" debug>
          <Checkbox />
        </Hitbox>
        <p className="text-muted-foreground text-sm">right</p>
      </div>
      <div className="flex flex-col items-center gap-4">
        <Hitbox position="vertical" debug>
          <Checkbox />
        </Hitbox>
        <p className="text-muted-foreground text-sm">vertical</p>
      </div>
      <div className="flex flex-col items-center gap-4">
        <Hitbox position="horizontal" debug>
          <Checkbox />
        </Hitbox>
        <p className="text-muted-foreground text-sm">horizontal</p>
      </div>
    </div>
  );
}
