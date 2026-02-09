"use client";

import { Badge } from "@/components/ui/badge";
import { BadgeOverflow } from "@/registry/bases/radix/ui/badge-overflow";

const tags = [
  "React",
  "TypeScript",
  "Next.js",
  "Tailwind CSS",
  "Shadcn UI",
  "Radix UI",
  "Zustand",
  "React Query",
  "Prisma",
  "PostgreSQL",
];

export default function BadgeOverflowDemo() {
  return (
    <div className="flex w-64 flex-col gap-8">
      <div className="flex flex-col gap-3">
        <h3 className="font-medium text-sm">Badge Overflow</h3>
        <div className="w-64 rounded-md border p-3">
          <BadgeOverflow
            items={tags}
            renderBadge={(_, label) => (
              <Badge variant="secondary">{label}</Badge>
            )}
          />
        </div>
      </div>
      <div className="flex flex-col gap-3">
        <h3 className="font-medium text-sm">
          Badge Overflow with Custom Overflow
        </h3>
        <div className="w-64 rounded-md border p-3">
          <BadgeOverflow
            items={tags}
            renderBadge={(_, label) => <Badge variant="default">{label}</Badge>}
            renderOverflow={(count) => (
              <Badge variant="secondary" className="bg-muted">
                +{count} more
              </Badge>
            )}
          />
        </div>
      </div>
    </div>
  );
}
