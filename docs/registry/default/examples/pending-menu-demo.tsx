"use client";

import * as React from "react";
import { Pending } from "@/registry/default/components/pending";

export default function PendingMenuDemo() {
  const [pendingAction, setPendingAction] = React.useState<string | null>(null);

  const onAction = (action: string) => {
    setPendingAction(action);

    // Simulate async action
    setTimeout(() => {
      setPendingAction(null);
    }, 2000);
  };

  const menuItems = [
    { id: "export", label: "Export Data", icon: "↑" },
    { id: "sync", label: "Sync Changes", icon: "↻" },
    { id: "archive", label: "Archive Items", icon: "📦" },
  ];

  return (
    <div className="mx-auto w-full max-w-xs rounded-lg border bg-card p-2 text-card-foreground shadow-sm">
      {menuItems.map((item) => (
        <Pending key={item.id} isPending={pendingAction === item.id}>
          <button
            onClick={() => onAction(item.id)}
            className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground data-pending:cursor-wait data-pending:opacity-70"
          >
            <span className="text-lg">{item.icon}</span>
            <span>
              {pendingAction === item.id ? "Processing..." : item.label}
            </span>
          </button>
        </Pending>
      ))}
    </div>
  );
}

