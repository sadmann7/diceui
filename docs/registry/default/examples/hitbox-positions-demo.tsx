import { Button } from "@/components/ui/button";
import { Hitbox } from "@/registry/default/components/hitbox";

export default function HitboxPositionsDemo() {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      <div className="flex flex-col items-center gap-2.5">
        <Hitbox debug>
          <Button size="sm">All</Button>
        </Hitbox>
        <p className="text-muted-foreground text-xs">all</p>
      </div>
      <div className="flex flex-col items-center gap-2.5">
        <Hitbox position="top" debug>
          <Button size="sm">Top</Button>
        </Hitbox>
        <p className="text-muted-foreground text-xs">top</p>
      </div>
      <div className="flex flex-col items-center gap-2.5">
        <Hitbox position="bottom" debug>
          <Button size="sm">Bottom</Button>
        </Hitbox>
        <p className="text-muted-foreground text-xs">bottom</p>
      </div>
      <div className="flex flex-col items-center gap-2.5">
        <Hitbox position="left" debug>
          <Button size="sm">Left</Button>
        </Hitbox>
        <p className="text-muted-foreground text-xs">left</p>
      </div>
      <div className="flex flex-col items-center gap-2.5">
        <Hitbox position="right" debug>
          <Button size="sm">Right</Button>
        </Hitbox>
        <p className="text-muted-foreground text-xs">right</p>
      </div>
      <div className="flex flex-col items-center gap-2.5">
        <Hitbox position="vertical" debug>
          <Button size="sm">Vertical</Button>
        </Hitbox>
        <p className="text-muted-foreground text-xs">vertical</p>
      </div>
      <div className="flex flex-col items-center gap-2.5">
        <Hitbox position="horizontal" debug>
          <Button size="sm">Horizontal</Button>
        </Hitbox>
        <p className="text-muted-foreground text-xs">horizontal</p>
      </div>
    </div>
  );
}
