import * as Kbd from "@/registry/default/ui/kbd";

export default function KbdMultipleDemo() {
  return (
    <div className="grid gap-6 sm:grid-cols-2">
      <div className="flex flex-col gap-2">
        <span className="text-muted-foreground text-sm">IDE shortcuts</span>
        <div className="flex flex-col gap-2">
          <Kbd.Root>
            <Kbd.Key>⌘</Kbd.Key>
            <Kbd.Separator />
            <Kbd.Key>⇧</Kbd.Key>
            <Kbd.Separator />
            <Kbd.Key description="Find in files">F</Kbd.Key>
          </Kbd.Root>
          <Kbd.Root>
            <Kbd.Key>⌘</Kbd.Key>
            <Kbd.Separator />
            <Kbd.Key>⌥</Kbd.Key>
            <Kbd.Separator />
            <Kbd.Key description="Multi-cursor">↓</Kbd.Key>
          </Kbd.Root>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <span className="text-muted-foreground text-sm">System shortcuts</span>
        <div className="flex flex-col gap-2">
          <Kbd.Root>
            <Kbd.Key>⌘</Kbd.Key>
            <Kbd.Separator />
            <Kbd.Key>⌥</Kbd.Key>
            <Kbd.Separator />
            <Kbd.Key description="Force quit">⎋</Kbd.Key>
          </Kbd.Root>
          <Kbd.Root>
            <Kbd.Key>⌘</Kbd.Key>
            <Kbd.Separator />
            <Kbd.Key>⇧</Kbd.Key>
            <Kbd.Separator />
            <Kbd.Key>⌥</Kbd.Key>
            <Kbd.Separator />
            <Kbd.Key description="System preferences">P</Kbd.Key>
          </Kbd.Root>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-muted-foreground text-sm">Browser shortcuts</span>
        <div className="flex flex-col gap-2">
          <Kbd.Root>
            <Kbd.Key>⌘</Kbd.Key>
            <Kbd.Separator />
            <Kbd.Key>⇧</Kbd.Key>
            <Kbd.Separator />
            <Kbd.Key description="New incognito window">N</Kbd.Key>
          </Kbd.Root>
          <Kbd.Root>
            <Kbd.Key>⌘</Kbd.Key>
            <Kbd.Separator />
            <Kbd.Key>⌥</Kbd.Key>
            <Kbd.Separator />
            <Kbd.Key description="Developer tools">I</Kbd.Key>
          </Kbd.Root>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <span className="text-muted-foreground text-sm">With descriptions</span>
        <div className="flex flex-col gap-2">
          <Kbd.Root>
            <Kbd.Key description="Control">⌃</Kbd.Key>
            <Kbd.Separator />
            <Kbd.Key description="Option">⌥</Kbd.Key>
            <Kbd.Separator />
            <Kbd.Key description="Delete">⌫</Kbd.Key>
          </Kbd.Root>
          <Kbd.Root>
            <Kbd.Key description="Command">⌘</Kbd.Key>
            <Kbd.Separator />
            <Kbd.Key description="Shift">⇧</Kbd.Key>
            <Kbd.Separator />
            <Kbd.Key description="Question mark">?</Kbd.Key>
          </Kbd.Root>
        </div>
      </div>
    </div>
  );
}
