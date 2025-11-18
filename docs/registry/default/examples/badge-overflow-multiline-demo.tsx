"use client";

import { Badge } from "@/components/ui/badge";
import { BadgeOverflow } from "@/registry/default/ui/badge-overflow";

const technologies = [
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
  "Docker",
  "Kubernetes",
  "AWS",
  "Vercel",
  "GitHub Actions",
];

export default function BadgeOverflowMultilineDemo() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <h3 className="font-medium text-sm">Single Line (default)</h3>
        <div className="w-64 rounded-lg border p-4">
          <BadgeOverflow
            items={technologies}
            getLabel={(tech) => tech}
            renderBadge={(_, label) => (
              <Badge variant="secondary">{label}</Badge>
            )}
          />
        </div>
      </div>
      <div className="flex flex-col gap-3">
        <h3 className="font-medium text-sm">Two Lines</h3>
        <div className="w-64 rounded-lg border p-4">
          <BadgeOverflow
            items={technologies}
            getLabel={(tech) => tech}
            lineCount={2}
            renderBadge={(_, label) => <Badge variant="outline">{label}</Badge>}
          />
        </div>
      </div>
      <div className="flex flex-col gap-3">
        <h3 className="font-medium text-sm">Three Lines</h3>
        <div className="w-64 rounded-lg border p-4">
          <BadgeOverflow
            items={technologies}
            getLabel={(tech) => tech}
            lineCount={3}
            renderBadge={(_, label) => <Badge variant="default">{label}</Badge>}
          />
        </div>
      </div>
    </div>
  );
}
