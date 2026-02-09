import { Checkbox } from "@/components/ui/checkbox";
import { Hitbox } from "@/registry/bases/radix/components/hitbox";

export default function HitboxSizesDemo() {
  return (
    <div className="flex items-center gap-8">
      <div className="flex flex-col items-center gap-4">
        <Hitbox debug>
          <Checkbox />
        </Hitbox>
        <p className="text-muted-foreground text-sm">default</p>
      </div>
      <div className="flex flex-col items-center gap-4">
        <Hitbox size="sm" debug>
          <Checkbox />
        </Hitbox>
        <p className="text-muted-foreground text-sm">sm</p>
      </div>
      <div className="flex flex-col items-center gap-4">
        <Hitbox size="lg" debug>
          <Checkbox />
        </Hitbox>
        <p className="text-muted-foreground text-sm">lg</p>
      </div>
      <div className="flex flex-col items-center gap-4">
        <Hitbox size="10px" debug>
          <Checkbox />
        </Hitbox>
        <p className="text-muted-foreground text-sm">10px</p>
      </div>
    </div>
  );
}
