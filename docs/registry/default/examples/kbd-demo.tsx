import * as Kbd from "@/registry/default/ui/kbd";

export default function KbdDemo() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <span className="text-muted-foreground text-sm">Basic shortcut</span>
        <Kbd.Root>
          <Kbd.Key>⌘</Kbd.Key>
          <Kbd.Separator />
          <Kbd.Key title="Search">K</Kbd.Key>
        </Kbd.Root>
      </div>
      <div className="flex flex-col gap-2">
        <span className="text-muted-foreground text-sm">Multiple keys</span>
        <Kbd.Root>
          <Kbd.Key>⌘</Kbd.Key>
          <Kbd.Separator />
          <Kbd.Key>⇧</Kbd.Key>
          <Kbd.Separator />
          <Kbd.Key title="Save">S</Kbd.Key>
        </Kbd.Root>
      </div>
      <div className="flex flex-col gap-2">
        <span className="text-muted-foreground text-sm">With descriptions</span>
        <div className="flex items-center gap-4">
          <Kbd.Root>
            <Kbd.Key title="Windows key">⊞</Kbd.Key>
            <Kbd.Separator />
            <Kbd.Key title="Lock screen">L</Kbd.Key>
          </Kbd.Root>
          <Kbd.Root>
            <Kbd.Key title="Option">⌥</Kbd.Key>
            <Kbd.Separator />
            <Kbd.Key title="Delete word">⌫</Kbd.Key>
          </Kbd.Root>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <span className="text-muted-foreground text-sm">Different sizes</span>
        <div className="flex items-end gap-4">
          <Kbd.Root size="sm">
            <Kbd.Key>⌘</Kbd.Key>
            <Kbd.Separator />
            <Kbd.Key>P</Kbd.Key>
          </Kbd.Root>
          <Kbd.Root>
            <Kbd.Key>⌘</Kbd.Key>
            <Kbd.Separator />
            <Kbd.Key>P</Kbd.Key>
          </Kbd.Root>
          <Kbd.Root size="lg">
            <Kbd.Key>⌘</Kbd.Key>
            <Kbd.Separator />
            <Kbd.Key>P</Kbd.Key>
          </Kbd.Root>
        </div>
      </div>
    </div>
  );
}
