import { Badge } from "@/components/ui/badge";
import * as Stack from "@/registry/default/ui/stack";

const technologies = [
  "React",
  "TypeScript",
  "Next.js",
  "Tailwind CSS",
  "Node.js",
  "GraphQL",
  "PostgreSQL",
  "Docker",
];

const priorities = [
  { label: "High", variant: "destructive" as const },
  { label: "Medium", variant: "secondary" as const },
  { label: "Low", variant: "outline" as const },
];

export default function StackBadgesDemo() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <h3 className="font-medium text-sm">Technology Stack</h3>
        <Stack.Root spacing="sm">
          {technologies.slice(0, 4).map((tech) => (
            <Stack.Item key={tech}>
              <Badge variant="secondary">{tech}</Badge>
            </Stack.Item>
          ))}
        </Stack.Root>
      </div>

      <div className="flex flex-col gap-3">
        <h3 className="font-medium text-sm">Priority Tags</h3>
        <Stack.Root spacing="md">
          {priorities.map((priority) => (
            <Stack.Item key={priority.label}>
              <Badge variant={priority.variant}>{priority.label}</Badge>
            </Stack.Item>
          ))}
        </Stack.Root>
      </div>

      <div className="flex flex-col gap-3">
        <h3 className="font-medium text-sm">Vertical Badge Stack</h3>
        <Stack.Root direction="vertical" spacing="xs" align="start">
          {technologies.slice(0, 3).map((tech) => (
            <Stack.Item key={tech}>
              <Badge variant="outline">{tech}</Badge>
            </Stack.Item>
          ))}
        </Stack.Root>
      </div>

      <div className="flex flex-col gap-3">
        <h3 className="font-medium text-sm">Badge Stack with More</h3>
        <Stack.Root spacing="sm">
          {technologies.slice(0, 3).map((tech) => (
            <Stack.Item key={tech}>
              <Badge variant="secondary">{tech}</Badge>
            </Stack.Item>
          ))}
          <Stack.Item>
            <Badge variant="outline">+5 more</Badge>
          </Stack.Item>
        </Stack.Root>
      </div>
    </div>
  );
}
