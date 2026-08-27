import { Hitbox } from "@/registry/bases/base/components/hitbox";
import { Checkbox } from "@/registry/bases/base/ui/checkbox";

export default function HitboxDemo() {
  return (
    <div className="flex items-center gap-8">
      <div className="flex flex-col items-center gap-4">
        <Hitbox debug>
          <Checkbox />
        </Hitbox>
        <p className="text-sm text-muted-foreground">Default Size</p>
      </div>
      <div className="flex flex-col items-center gap-4">
        <Hitbox radius="full" debug>
          <Checkbox />
        </Hitbox>
        <p className="text-sm text-muted-foreground">Full Radius</p>
      </div>
      <div className="flex flex-col items-center gap-4">
        <Hitbox position="bottom" debug>
          <Checkbox />
        </Hitbox>
        <p className="text-sm text-muted-foreground">Bottom Position</p>
      </div>
    </div>
  );
}
