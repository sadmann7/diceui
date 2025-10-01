import { Button } from "@/components/ui/button";
import { Hitbox } from "@/registry/default/ui/hitbox";

export default function HitboxSizesDemo() {
  return (
    <div className="flex items-center gap-6">
      <div className="flex flex-col items-center gap-2.5">
        <Hitbox debug>
          <Button>Default</Button>
        </Hitbox>
        <p className="text-muted-foreground text-xs">default</p>
      </div>
      <div className="flex flex-col items-center gap-2.5">
        <Hitbox size="sm" debug>
          <Button>Small</Button>
        </Hitbox>
        <p className="text-muted-foreground text-xs">sm</p>
      </div>
      <div className="flex flex-col items-center gap-2.5">
        <Hitbox size="lg" debug>
          <Button>Large</Button>
        </Hitbox>
        <p className="text-muted-foreground text-xs">lg</p>
      </div>
    </div>
  );
}
