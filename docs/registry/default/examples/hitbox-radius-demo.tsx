import { ShapesIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Hitbox } from "@/registry/default/components/hitbox";

export default function HitboxRadiusDemo() {
  return (
    <div className="flex items-center gap-6">
      <div className="flex flex-col items-center gap-2.5">
        <Hitbox radius="none" debug>
          <Button>None</Button>
        </Hitbox>
        <p className="text-muted-foreground text-xs">none</p>
      </div>
      <div className="flex flex-col items-center gap-2.5">
        <Hitbox radius="sm" debug>
          <Button>Small</Button>
        </Hitbox>
        <p className="text-muted-foreground text-xs">sm</p>
      </div>
      <div className="flex flex-col items-center gap-2.5">
        <Hitbox radius="md" debug>
          <Button>Medium</Button>
        </Hitbox>
        <p className="text-muted-foreground text-xs">md</p>
      </div>
      <div className="flex flex-col items-center gap-2.5">
        <Hitbox radius="lg" debug>
          <Button>Large</Button>
        </Hitbox>
        <p className="text-muted-foreground text-xs">lg</p>
      </div>
      <div className="flex flex-col items-center gap-2.5">
        <Hitbox radius="full" debug>
          <Button size="icon" className="size-8 rounded-full">
            <ShapesIcon />
          </Button>
        </Hitbox>
        <p className="text-muted-foreground text-xs">full</p>
      </div>
    </div>
  );
}
