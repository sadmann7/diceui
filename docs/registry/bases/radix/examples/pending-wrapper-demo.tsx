"use client";

import { Loader2 } from "lucide-react";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Pending } from "@/registry/bases/radix/components/pending";

export default function PendingWrapperDemo() {
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const onSubmit = React.useCallback(() => {
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
    }, 2000);
  }, []);

  return (
    <div className="flex flex-col items-center gap-4">
      <Pending isPending={isSubmitting}>
        <Button onClick={onSubmit}>
          {isSubmitting && <Loader2 className="size-4 animate-spin" />}
          {isSubmitting ? "Submitting..." : "Submit with Wrapper"}
        </Button>
      </Pending>

      <p className="text-muted-foreground text-sm">
        Using the <code className="text-xs">{"<Pending>"}</code> wrapper
        component
      </p>
    </div>
  );
}
