"use client";

import { Bell, CreditCard, Settings, Users } from "lucide-react";
import * as React from "react";

import { Button } from "@/registry/bases/radix/ui/button";
import {
  CommandStack,
  CommandStackBreadcrumb,
  CommandStackEmpty,
  CommandStackInput,
  CommandStackItem,
  CommandStackList,
  CommandStackPage,
} from "@/registry/bases/radix/ui/command-stack";

const sections = [
  {
    value: "general",
    label: "General",
    icon: Settings,
    items: ["Workspace name", "Workspace URL", "Default language"],
  },
  {
    value: "members",
    label: "Members",
    icon: Users,
    items: ["Invite members", "Manage roles", "Pending invites"],
  },
  {
    value: "billing",
    label: "Billing",
    icon: CreditCard,
    items: ["Change plan", "Payment method", "Invoices"],
  },
  {
    value: "notifications",
    label: "Notifications",
    icon: Bell,
    items: ["Email", "Desktop", "Slack"],
  },
];

export default function CommandStackControlledDemo() {
  const [pages, setPages] = React.useState(["root"]);

  return (
    <div className="flex w-full max-w-md flex-col gap-4">
      <CommandStack
        pages={pages}
        onPagesChange={setPages}
        className="rounded-lg border shadow-md"
      >
        <CommandStackBreadcrumb />
        <CommandStackInput placeholder="Search settings..." />
        <CommandStackList>
          <CommandStackEmpty>No settings found.</CommandStackEmpty>
          <CommandStackPage value="root" label="Settings">
            {sections.map((section) => (
              <CommandStackItem key={section.value} page={section.value}>
                <section.icon />
                {section.label}
              </CommandStackItem>
            ))}
          </CommandStackPage>
          {sections.map((section) => (
            <CommandStackPage
              key={section.value}
              value={section.value}
              label={section.label}
              placeholder={`Search ${section.label.toLowerCase()} settings...`}
            >
              {section.items.map((item) => (
                <CommandStackItem key={item}>{item}</CommandStackItem>
              ))}
            </CommandStackPage>
          ))}
        </CommandStackList>
      </CommandStack>
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
          Back to settings
        </Button>
      </div>
    </div>
  );
}
