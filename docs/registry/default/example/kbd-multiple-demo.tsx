"use client";

import * as Kbd from "@/registry/default/ui/kbd";
import * as React from "react";

export default function KbdMultipleDemo() {
  return (
    <div className="flex flex-col gap-8">
      {/* Common IDE Shortcuts */}
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">Common IDE shortcuts</p>
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

      {/* System Shortcuts */}
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">System shortcuts</p>
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

      {/* Browser Shortcuts */}
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">Browser shortcuts</p>
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

      {/* With Descriptions */}
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">With descriptions</p>
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
