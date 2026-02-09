"use client";

import * as React from "react";
import { Pending } from "@/registry/bases/radix/components/pending";

export default function PendingLinkDemo() {
  const [isPending, setIsPending] = React.useState(false);

  const onNavigate = React.useCallback(
    (event: React.MouseEvent<HTMLAnchorElement>) => {
      event.preventDefault();
      setIsPending(true);

      // Simulate async navigation
      setTimeout(() => {
        setIsPending(false);
      }, 2000);
    },
    [],
  );

  return (
    <div className="flex items-center justify-center">
      <Pending isPending={isPending}>
        <a
          href="/docs/components/pending"
          onClick={onNavigate}
          className="text-primary underline-offset-4 hover:underline"
        >
          {isPending ? "Loading dashboard..." : "Go to Dashboard"}
        </a>
      </Pending>
    </div>
  );
}
