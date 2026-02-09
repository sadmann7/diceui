import { Checkbox } from "@/components/ui/checkbox";
import { Hitbox } from "@/registry/bases/radix/components/hitbox";

export default function HitboxRadiiDemo() {
  return (
    <div className="flex items-center gap-8">
      <div className="flex flex-col items-center gap-4">
        <Hitbox radius="none" debug>
          <Checkbox />
        </Hitbox>
        <p className="text-muted-foreground text-sm">none</p>
      </div>
      <div className="flex flex-col items-center gap-4">
        <Hitbox radius="sm" debug>
          <Checkbox />
        </Hitbox>
        <p className="text-muted-foreground text-sm">sm</p>
      </div>
      <div className="flex flex-col items-center gap-4">
        <Hitbox radius="md" debug>
          <Checkbox />
        </Hitbox>
        <p className="text-muted-foreground text-sm">md</p>
      </div>
      <div className="flex flex-col items-center gap-4">
        <Hitbox radius="lg" debug>
          <Checkbox />
        </Hitbox>
        <p className="text-muted-foreground text-sm">lg</p>
      </div>
      <div className="flex flex-col items-center gap-4">
        <Hitbox radius="full" debug>
          <Checkbox />
        </Hitbox>
        <p className="text-muted-foreground text-sm">full</p>
      </div>
    </div>
  );
}
