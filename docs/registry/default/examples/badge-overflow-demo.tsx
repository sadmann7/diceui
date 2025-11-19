"use client";

import { Badge } from "@/components/ui/badge";
import {
  BadgeOverflow,
  BadgeOverflowItem,
  BadgeOverflowOverflow,
} from "@/registry/default/ui/badge-overflow";

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
    <div className="flex w-full flex-col gap-8">
      <div className="flex flex-col gap-3">
        <h3 className="font-medium text-sm">Single Line (Default)</h3>
        <div className="w-96 rounded-md border p-4">
          <BadgeOverflow className="gap-2">
            {tags.map((tag, index) => (
              <BadgeOverflowItem key={tag} index={index} asChild>
                <Badge variant="secondary">{tag}</Badge>
              </BadgeOverflowItem>
            ))}
            <BadgeOverflowOverflow />
          </BadgeOverflow>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <h3 className="font-medium text-sm">Multi-line (2 rows)</h3>
        <div className="w-96 rounded-md border p-4">
          <BadgeOverflow lineCount={2} className="gap-2">
            {tags.map((tag, index) => (
              <BadgeOverflowItem key={tag} index={index} asChild>
                <Badge variant="outline">{tag}</Badge>
              </BadgeOverflowItem>
            ))}
            <BadgeOverflowOverflow />
          </BadgeOverflow>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <h3 className="font-medium text-sm">Custom Overflow Styling</h3>
        <div className="w-96 rounded-md border p-4">
          <BadgeOverflow className="gap-2">
            {tags.map((tag, index) => (
              <BadgeOverflowItem key={tag} index={index} asChild>
                <Badge variant="default">{tag}</Badge>
              </BadgeOverflowItem>
            ))}
            <BadgeOverflowOverflow className="bg-primary text-primary-foreground" />
          </BadgeOverflow>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <h3 className="font-medium text-sm">Responsive Width</h3>
        <div className="w-full rounded-md border p-4">
          <BadgeOverflow className="gap-2">
            {tags.map((tag, index) => (
              <BadgeOverflowItem key={tag} index={index} asChild>
                <Badge variant="secondary">{tag}</Badge>
              </BadgeOverflowItem>
            ))}
            <BadgeOverflowOverflow />
          </BadgeOverflow>
        </div>
      </div>
    </div>
  );
}
