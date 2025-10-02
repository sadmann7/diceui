import { ShapesIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Hitbox } from "@/registry/default/components/hitbox";

export default function HitboxDemo() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <h3 className="font-semibold text-lg">Sizes</h3>
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-center gap-2.5">
            <Hitbox debug>
              <Button size="sm">Default</Button>
            </Hitbox>
            <p className="text-muted-foreground text-xs">default</p>
          </div>
          <div className="flex flex-col items-center gap-2.5">
            <Hitbox size="sm" debug>
              <Button size="sm">Small</Button>
            </Hitbox>
            <p className="text-muted-foreground text-xs">sm</p>
          </div>
          <div className="flex flex-col items-center gap-2.5">
            <Hitbox size="lg" debug>
              <Button size="sm">Large</Button>
            </Hitbox>
            <p className="text-muted-foreground text-xs">lg</p>
          </div>
          <div className="flex flex-col items-center gap-2.5">
            <Hitbox size="5px" debug>
              <Button size="sm">Custom</Button>
            </Hitbox>
            <p className="text-muted-foreground text-xs">5px</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <h3 className="font-semibold text-lg">Positions</h3>
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
      </div>

      <div className="flex flex-col gap-2">
        <h3 className="font-semibold text-lg">Radius</h3>
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-center gap-2.5">
            <Hitbox radius="none" debug>
              <Button size="sm">None</Button>
            </Hitbox>
            <p className="text-muted-foreground text-xs">none</p>
          </div>
          <div className="flex flex-col items-center gap-2.5">
            <Hitbox radius="sm" debug>
              <Button size="sm">Small</Button>
            </Hitbox>
            <p className="text-muted-foreground text-xs">sm</p>
          </div>
          <div className="flex flex-col items-center gap-2.5">
            <Hitbox radius="md" debug>
              <Button size="sm">Medium</Button>
            </Hitbox>
            <p className="text-muted-foreground text-xs">md</p>
          </div>
          <div className="flex flex-col items-center gap-2.5">
            <Hitbox radius="lg" debug>
              <Button size="sm">Large</Button>
            </Hitbox>
            <p className="text-muted-foreground text-xs">lg</p>
          </div>
          <div className="flex flex-col items-center gap-2.5">
            <Hitbox radius="full" debug>
              <Button size="sm" className="size-8 rounded-full">
                <ShapesIcon />
              </Button>
            </Hitbox>
            <p className="text-muted-foreground text-xs">full</p>
          </div>
        </div>
      </div>
    </div>
  );
}
