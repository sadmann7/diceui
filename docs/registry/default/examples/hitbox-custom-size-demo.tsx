import { Button } from "@/components/ui/button";
import { Hitbox } from "@/registry/default/components/hitbox";

export default function HitboxCustomSizeDemo() {
  return (
    <div className="flex items-center gap-6">
      <div className="flex flex-col items-center gap-2.5">
        <Hitbox size="5px" debug>
          <Button size="sm">5px</Button>
        </Hitbox>
        <p className="text-muted-foreground text-xs">5px</p>
      </div>
      <div className="flex flex-col items-center gap-2.5">
        <Hitbox size="1rem" debug>
          <Button size="sm">1rem</Button>
        </Hitbox>
        <p className="text-muted-foreground text-xs">1rem</p>
      </div>
      <div className="flex flex-col items-center gap-2.5">
        <Hitbox size="20px" debug>
          <Button size="sm">20px</Button>
        </Hitbox>
        <p className="text-muted-foreground text-xs">20px</p>
      </div>
      <div className="flex flex-col items-center gap-2.5">
        <Hitbox size="2em" debug>
          <Button size="sm">2em</Button>
        </Hitbox>
        <p className="text-muted-foreground text-xs">2em</p>
      </div>
    </div>
  );
}
