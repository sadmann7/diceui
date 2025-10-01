import { Button } from "@/components/ui/button";
import { Hitbox } from "@/registry/default/ui/hitbox";

export default function HitboxDebugDemo() {
  return (
    <div className="flex items-center gap-8">
      <div className="flex flex-col items-center gap-2.5">
        <Hitbox debug={false}>
          <Button>Debug Off</Button>
        </Hitbox>
        <p className="text-muted-foreground text-xs">debug=false</p>
      </div>
      <div className="flex flex-col items-center gap-2.5">
        <Hitbox debug>
          <Button>Debug On</Button>
        </Hitbox>
        <p className="text-muted-foreground text-xs">debug=true</p>
      </div>
    </div>
  );
}
