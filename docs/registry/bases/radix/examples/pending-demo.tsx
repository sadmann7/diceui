"use client";

import { Loader2 } from "lucide-react";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { usePending } from "@/registry/bases/radix/components/pending";

export default function PendingDemo() {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { pendingProps, isPending } = usePending({ isPending: isSubmitting });

  const onSubmit = React.useCallback(() => {
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
    }, 2000);
  }, []);

  return (
    <div className="flex flex-col items-center gap-4">
      <Button onClick={onSubmit} {...pendingProps}>
        {isPending && <Loader2 className="size-4 animate-spin" />}
        {isPending ? "Submitting..." : "Submit"}
      </Button>

      <p className="text-muted-foreground text-sm">
        {isPending
          ? "Button is pending - try tabbing to it and pressing Enter"
          : "Click the button to see pending state"}
      </p>
    </div>
  );
}
