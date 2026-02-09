import { Checkbox } from "@/components/ui/checkbox";
import { Hitbox } from "@/registry/bases/radix/components/hitbox";

export default function HitboxDebugDemo() {
  return (
    <div className="flex items-center gap-8">
      <div className="flex flex-col items-center gap-4">
        <Hitbox debug={false}>
          <Checkbox />
        </Hitbox>
        <p className="text-muted-foreground text-sm">debug=false</p>
      </div>
      <div className="flex flex-col items-center gap-4">
        <Hitbox debug>
          <Checkbox />
        </Hitbox>
        <p className="text-muted-foreground text-sm">debug=true</p>
      </div>
    </div>
  );
}
