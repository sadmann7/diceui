"use client";

import * as React from "react";

import { Button } from "@/registry/bases/radix/ui/button";
import {
  CommandPalette,
  CommandPaletteBreadcrumb,
  CommandPaletteEmpty,
  CommandPaletteInput,
  CommandPaletteItem,
  CommandPaletteList,
  CommandPalettePage,
} from "@/registry/bases/radix/ui/command-palette";

export default function CommandPaletteControlledDemo() {
  const [pages, setPages] = React.useState(["root"]);

  return (
    <div className="flex w-full max-w-md flex-col gap-4">
      <CommandPalette
        pages={pages}
        onPagesChange={setPages}
        className="rounded-lg border shadow-md"
      >
        <CommandPaletteBreadcrumb />
        <CommandPaletteInput placeholder="Search settings..." />
        <CommandPaletteList>
          <CommandPaletteEmpty>No results found.</CommandPaletteEmpty>
          <CommandPalettePage value="root" label="Settings">
            <CommandPaletteItem page="account">Account</CommandPaletteItem>
            <CommandPaletteItem page="notifications">
              Notifications
            </CommandPaletteItem>
          </CommandPalettePage>
          <CommandPalettePage value="account" label="Account">
            <CommandPaletteItem>Change email</CommandPaletteItem>
            <CommandPaletteItem>Change password</CommandPaletteItem>
          </CommandPalettePage>
          <CommandPalettePage value="notifications" label="Notifications">
            <CommandPaletteItem>Email</CommandPaletteItem>
            <CommandPaletteItem>Push</CommandPaletteItem>
          </CommandPalettePage>
        </CommandPaletteList>
      </CommandPalette>
      <div className="flex items-center gap-2">
        <p className="flex-1 truncate text-sm text-muted-foreground">
          Pages: {pages.join(" / ")}
        </p>
        <Button
          variant="outline"
          size="sm"
          disabled={pages.length === 1}
          onClick={() => setPages(["root"])}
        >
          Back to root
        </Button>
      </div>
    </div>
  );
}
