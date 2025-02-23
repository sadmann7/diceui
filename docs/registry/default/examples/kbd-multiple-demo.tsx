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
            <Kbd.Key title="Find in files">F</Kbd.Key>
          </Kbd.Root>
          <Kbd.Root>
            <Kbd.Key>⌘</Kbd.Key>
            <Kbd.Separator />
            <Kbd.Key>⌥</Kbd.Key>
            <Kbd.Separator />
            <Kbd.Key title="Multi-cursor">↓</Kbd.Key>
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
            <Kbd.Key title="Force quit">⎋</Kbd.Key>
          </Kbd.Root>
          <Kbd.Root>
            <Kbd.Key>⌘</Kbd.Key>
            <Kbd.Separator />
            <Kbd.Key>⇧</Kbd.Key>
            <Kbd.Separator />
            <Kbd.Key>⌥</Kbd.Key>
            <Kbd.Separator />
            <Kbd.Key title="System preferences">P</Kbd.Key>
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
            <Kbd.Key title="New incognito window">N</Kbd.Key>
          </Kbd.Root>
          <Kbd.Root>
            <Kbd.Key>⌘</Kbd.Key>
            <Kbd.Separator />
            <Kbd.Key>⌥</Kbd.Key>
            <Kbd.Separator />
            <Kbd.Key title="Developer tools">I</Kbd.Key>
          </Kbd.Root>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <span className="text-muted-foreground text-sm">With descriptions</span>
        <div className="flex flex-col gap-2">
          <Kbd.Root>
            <Kbd.Key title="Control">⌃</Kbd.Key>
            <Kbd.Separator />
            <Kbd.Key title="Option">⌥</Kbd.Key>
            <Kbd.Separator />
            <Kbd.Key title="Delete">⌫</Kbd.Key>
          </Kbd.Root>
          <Kbd.Root>
            <Kbd.Key title="Command">⌘</Kbd.Key>
            <Kbd.Separator />
            <Kbd.Key title="Shift">⇧</Kbd.Key>
            <Kbd.Separator />
            <Kbd.Key title="Question mark">?</Kbd.Key>
          </Kbd.Root>
        </div>
      </div>
    </div>
  );
}
