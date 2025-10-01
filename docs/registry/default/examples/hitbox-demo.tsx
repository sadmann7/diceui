import { ShapesIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Hitbox } from "@/registry/default/ui/hitbox";

export default function HitboxDemo() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h3 className="font-semibold text-lg">Sizes</h3>
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-center gap-2.5">
            <Hitbox size="sm" debug>
              <Button variant="outline" size="sm">
                Kickflip
              </Button>
            </Hitbox>
            <p className="text-muted-foreground text-xs">sm</p>
          </div>
          <div className="flex flex-col items-center gap-2.5">
            <Hitbox size="default" debug>
              <Button variant="outline">Heelflip</Button>
            </Hitbox>
            <p className="text-muted-foreground text-xs">default</p>
          </div>
          <div className="flex flex-col items-center gap-2.5">
            <Hitbox size="lg" debug>
              <Button variant="outline">Tre Flip</Button>
            </Hitbox>
            <p className="text-muted-foreground text-xs">lg</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <h3 className="font-semibold text-lg">Positions</h3>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="flex flex-col items-center gap-2.5">
            <Hitbox position="default" debug>
              <Button variant="outline" size="sm">
                Default
              </Button>
            </Hitbox>
            <p className="text-muted-foreground text-xs">default</p>
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
        <h3 className="font-semibold text-lg">Shapes</h3>
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-center gap-2.5">
            <Hitbox shape="default" debug>
              <Button>Default</Button>
            </Hitbox>
            <p className="text-muted-foreground text-xs">default</p>
          </div>
          <div className="flex flex-col items-center gap-2.5">
            <Hitbox shape="rounded" debug>
              <Button>Rounded</Button>
            </Hitbox>
            <p className="text-muted-foreground text-xs">rounded</p>
          </div>
          <div className="flex flex-col items-center gap-2.5">
            <Hitbox shape="circular" debug>
              <Button size="icon" className="size-8 rounded-full">
                <ShapesIcon />
              </Button>
            </Hitbox>
            <p className="text-muted-foreground text-xs">circular</p>
          </div>
        </div>
      </div>
    </div>
  );
}
