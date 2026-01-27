"use client";

import * as React from "react";
import { TrashIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  ResponsiveDialog,
  ResponsiveDialogClose,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogFooter,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
  ResponsiveDialogTrigger,
} from "@/registry/default/ui/responsive-dialog";

export default function ResponsiveDialogConfirmDemo() {
  const [isDeleting, setIsDeleting] = React.useState(false);

  function onDelete() {
    setIsDeleting(true);
    // Simulate deletion
    setTimeout(() => {
      setIsDeleting(false);
    }, 1000);
  }

  return (
    <ResponsiveDialog>
      <ResponsiveDialogTrigger asChild>
        <Button variant="destructive">
          <TrashIcon />
          Delete Project
        </Button>
      </ResponsiveDialogTrigger>
      <ResponsiveDialogContent>
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>Delete project?</ResponsiveDialogTitle>
          <ResponsiveDialogDescription>
            This will permanently delete &quot;My Awesome Project&quot; and all
            of its data. This action cannot be undone.
          </ResponsiveDialogDescription>
        </ResponsiveDialogHeader>
        <ResponsiveDialogFooter className="gap-2 sm:gap-0">
          <ResponsiveDialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </ResponsiveDialogClose>
          <Button variant="destructive" onClick={onDelete} disabled={isDeleting}>
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </ResponsiveDialogFooter>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}
