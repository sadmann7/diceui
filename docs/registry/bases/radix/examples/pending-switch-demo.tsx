"use client";

import * as React from "react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Pending } from "@/registry/bases/radix/components/pending";

export default function PendingSwitchDemo() {
  const [isEnabled, setIsEnabled] = React.useState(false);
  const [isPending, setIsPending] = React.useState(false);

  const onToggle = React.useCallback(() => {
    setIsPending(true);

    // Simulate async API call to save setting
    setTimeout(() => {
      setIsEnabled((prev) => !prev);
      setIsPending(false);
    }, 1500);
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <Label htmlFor="notifications">Email Notifications</Label>
          <p className="text-muted-foreground text-sm">
            {isPending
              ? "Saving..."
              : "Receive email about your account activity"}
          </p>
        </div>
        <Pending isPending={isPending}>
          <Switch
            id="notifications"
            checked={isEnabled}
            onCheckedChange={onToggle}
            className="data-pending:cursor-wait data-pending:opacity-70"
          />
        </Pending>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <Label htmlFor="marketing">Marketing Updates</Label>
          <p className="text-muted-foreground text-sm">
            Get tips, updates, and special offers
          </p>
        </div>
        <Switch id="marketing" />
      </div>
    </div>
  );
}
