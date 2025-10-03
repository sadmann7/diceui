import { ShapesIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Hitbox } from "@/registry/default/components/hitbox";

export default function HitboxDemo() {
  return (
    <div className="flex items-center gap-8">
      <div className="flex flex-col items-center gap-4">
        <Hitbox debug>
          <Button size="sm">Default</Button>
        </Hitbox>
        <p className="text-muted-foreground text-xs">Default Size</p>
      </div>
      <div className="flex flex-col items-center gap-4">
        <Hitbox radius="full" debug>
          <Button size="sm" className="size-8 rounded-full">
            <ShapesIcon />
          </Button>
        </Hitbox>
        <p className="text-muted-foreground text-xs">Full Radius</p>
      </div>
      <div className="flex flex-col items-center gap-4">
        <Hitbox position="bottom" debug>
          <Button size="sm">Bottom</Button>
        </Hitbox>
        <p className="text-muted-foreground text-xs">Bottom Position</p>
      </div>
    </div>
  );
}
