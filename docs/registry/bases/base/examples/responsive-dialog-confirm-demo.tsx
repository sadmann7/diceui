"use client";

import { Loader2, TrashIcon } from "lucide-react";
import * as React from "react";
import { Button } from "@/registry/bases/base/ui/button";
import {
  ResponsiveDialog,
  ResponsiveDialogClose,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogFooter,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
  ResponsiveDialogTrigger,
} from "@/registry/bases/base/ui/responsive-dialog";

export default function ResponsiveDialogConfirmDemo() {
  const [isDeleting, setIsDeleting] = React.useState(false);

  const onDelete = React.useCallback(() => {
    setIsDeleting(true);
    // Simulate deletion
    setTimeout(() => {
      setIsDeleting(false);
    }, 1000);
  }, []);

  return (
    <ResponsiveDialog>
      <ResponsiveDialogTrigger
        render={
          <Button variant="destructive">
            <TrashIcon />
            Delete Project
          </Button>
        }
      />
      <ResponsiveDialogContent>
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>Delete project?</ResponsiveDialogTitle>
          <ResponsiveDialogDescription>
            This will permanently delete &quot;My Awesome Project&quot; and all
            of its data. This action cannot be undone.
          </ResponsiveDialogDescription>
        </ResponsiveDialogHeader>
        <ResponsiveDialogFooter>
          <ResponsiveDialogClose
            render={<Button variant="outline">Cancel</Button>}
          />
          <Button
            variant="destructive"
            onClick={onDelete}
            disabled={isDeleting}
          >
            {isDeleting && <Loader2 className="size-4 animate-spin" />}
            Delete
          </Button>
        </ResponsiveDialogFooter>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}
