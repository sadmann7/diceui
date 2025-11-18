"use client";

import { Badge } from "@/components/ui/badge";
import { BadgeOverflow } from "@/registry/default/ui/badge-overflow";

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
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <h3 className="font-medium text-sm">Basic Badge Overflow</h3>
        <div className="w-64 rounded-lg border p-4">
          <BadgeOverflow
            items={tags}
            getLabel={(tag) => tag}
            renderBadge={(_, label) => (
              <Badge variant="secondary">{label}</Badge>
            )}
          />
        </div>
      </div>
      <div className="flex flex-col gap-3">
        <h3 className="font-medium text-sm">Wider Container</h3>
        <div className="w-96 rounded-lg border p-4">
          <BadgeOverflow
            items={tags}
            getLabel={(tag) => tag}
            renderBadge={(_, label) => <Badge variant="outline">{label}</Badge>}
          />
        </div>
      </div>
      <div className="flex flex-col gap-3">
        <h3 className="font-medium text-sm">Custom Overflow Badge</h3>
        <div className="w-64 rounded-lg border p-4">
          <BadgeOverflow
            items={tags}
            getLabel={(tag) => tag}
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
