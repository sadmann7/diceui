"use client";

import { Loader2 } from "lucide-react";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usePending } from "@/registry/bases/radix/components/pending";

export default function PendingFormDemo() {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);
  const { pendingProps, isPending } = usePending({ isPending: isSubmitting });

  const onSubmit = React.useCallback((event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setSubmitted(false);

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 2000);
    }, 2000);
  }, []);

  return (
    <form onSubmit={onSubmit} className="w-full max-w-sm space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="you@example.com"
          required
          disabled={isPending}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="••••••••"
          required
          disabled={isPending}
        />
      </div>

      <Button type="submit" className="w-full" {...pendingProps}>
        {isPending && <Loader2 className="size-4 animate-spin" />}
        {isPending ? "Signing in..." : "Sign in"}
      </Button>

      {submitted && (
        <p className="text-center text-green-600 text-sm dark:text-green-400">
          Successfully signed in!
        </p>
      )}
    </form>
  );
}
