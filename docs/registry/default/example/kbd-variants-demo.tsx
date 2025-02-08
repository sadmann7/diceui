import * as Kbd from "@/registry/default/ui/kbd";

export default function KbdVariantsDemo() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <p className="text-muted-foreground text-sm">Default</p>
        <Kbd.Root>
          <Kbd.Key>⌘</Kbd.Key>
          <Kbd.Separator />
          <Kbd.Key>K</Kbd.Key>
        </Kbd.Root>
      </div>
      <div className="flex flex-col gap-2">
        <p className="text-muted-foreground text-sm">Outline</p>
        <Kbd.Root variant="outline">
          <Kbd.Key>⎋</Kbd.Key>
          <Kbd.Separator />
          <Kbd.Key description="Escape">Esc</Kbd.Key>
        </Kbd.Root>
      </div>
      <div className="flex flex-col gap-2">
        <p className="text-muted-foreground text-sm">Ghost</p>
        <Kbd.Root variant="ghost">
          <Kbd.Key>⌤</Kbd.Key>
          <Kbd.Separator />
          <Kbd.Key description="Return">Enter</Kbd.Key>
        </Kbd.Root>
      </div>
      <div className="flex flex-col gap-2">
        <p className="text-muted-foreground text-sm">Function keys</p>
        <div className="flex gap-2">
          <Kbd.Root variant="outline">
            <Kbd.Key description="Function key 1">F1</Kbd.Key>
          </Kbd.Root>
          <Kbd.Root variant="outline">
            <Kbd.Key description="Function key 5">F5</Kbd.Key>
          </Kbd.Root>
          <Kbd.Root variant="outline">
            <Kbd.Key description="Function key 11">F11</Kbd.Key>
          </Kbd.Root>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <p className="text-muted-foreground text-sm">Mixed variants</p>
        <div className="flex gap-2">
          <Kbd.Root>
            <Kbd.Key>⌘</Kbd.Key>
            <Kbd.Separator />
            <Kbd.Key>⇧</Kbd.Key>
            <Kbd.Separator />
            <Kbd.Key description="Find in files">F</Kbd.Key>
          </Kbd.Root>
          <Kbd.Root variant="outline">
            <Kbd.Key>⌥</Kbd.Key>
            <Kbd.Separator />
            <Kbd.Key description="Quick fix">.</Kbd.Key>
          </Kbd.Root>
        </div>
      </div>
    </div>
  );
}
