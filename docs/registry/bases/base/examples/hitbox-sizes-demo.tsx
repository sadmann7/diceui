import { Hitbox } from "@/registry/bases/base/components/hitbox";
import { Checkbox } from "@/registry/bases/base/ui/checkbox";

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
