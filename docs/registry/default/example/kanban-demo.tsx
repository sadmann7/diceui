"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import * as Kanban from "@/registry/default/ui/kanban";
import { GripVertical } from "lucide-react";
import * as React from "react";

interface Task {
  id: string;
  title: string;
  priority: "low" | "medium" | "high";
  description?: string;
  assignee?: string;
  dueDate?: string;
}

const INITIAL_TASKS: Record<string, Task[]> = {
  backlog: [
    {
      id: "1",
      title: "Add authentication",
      priority: "high",
      description: "Implement user authentication using NextAuth.js",
      assignee: "John Doe",
      dueDate: "2024-04-01",
    },
    {
      id: "2",
      title: "Create API endpoints",
      priority: "medium",
      description: "Design and implement RESTful API endpoints",
      assignee: "Jane Smith",
      dueDate: "2024-04-05",
    },
    {
      id: "3",
      title: "Write documentation",
      priority: "low",
      description: "Document API endpoints and component usage",
      assignee: "Bob Johnson",
      dueDate: "2024-04-10",
    },
  ],
  inProgress: [
    {
      id: "4",
      title: "Design system updates",
      priority: "high",
      description: "Update design tokens and component styles",
      assignee: "Alice Brown",
      dueDate: "2024-03-28",
    },
    {
      id: "5",
      title: "Implement dark mode",
      priority: "medium",
      description: "Add dark mode support using Tailwind",
      assignee: "Charlie Wilson",
      dueDate: "2024-04-02",
    },
  ],
  review: [
    {
      id: "6",
      title: "Code review",
      priority: "high",
      description: "Review pull requests and provide feedback",
      assignee: "David Miller",
      dueDate: "2024-03-27",
    },
  ],
  done: [
    {
      id: "7",
      title: "Setup project",
      priority: "high",
      description: "Initialize Next.js project with TypeScript",
      assignee: "Eve Davis",
      dueDate: "2024-03-25",
    },
    {
      id: "8",
      title: "Initial commit",
      priority: "low",
      description: "Create repository and add initial files",
      assignee: "Frank White",
      dueDate: "2024-03-24",
    },
  ],
};

const COLUMN_TITLES: Record<string, string> = {
  backlog: "Backlog",
  inProgress: "In Progress",
  review: "Review",
  done: "Done",
};

export default function KanbanDemo() {
  const [columns, setColumns] =
    React.useState<Record<string, Task[]>>(INITIAL_TASKS);

  return (
    <Kanban.Root
      value={columns}
      onValueChange={setColumns}
      getItemValue={(item) => item.id}
    >
      <Kanban.Board>
        {Object.entries(columns).map(([columnId, tasks]) => (
          <TaskColumn key={columnId} columnId={columnId} tasks={tasks} />
        ))}
      </Kanban.Board>
      <Kanban.Overlay>
        {({ value, variant }) => {
          if (variant === "column") {
            const [columnId, tasks] =
              Object.entries(columns).find(([id]) => id === value) ?? [];

            if (!columnId || !tasks) return null;

            return (
              <TaskColumn
                key={columnId}
                columnId={columnId}
                tasks={tasks}
                asHandle
              />
            );
          }

          const task = Object.values(columns)
            .flat()
            .find((task) => task.id === value);

          if (!task) return null;

          return <TaskCard key={task.id} task={task} />;
        }}
      </Kanban.Overlay>
    </Kanban.Root>
  );
}

interface TaskCardProps
  extends Omit<React.ComponentProps<typeof Kanban.Item>, "value"> {
  task: Task;
}

function TaskCard({ task, ...props }: TaskCardProps) {
  return (
    <Kanban.Item value={task.id} asChild {...props}>
      <div className="rounded-md border bg-card p-4 shadow-sm transition-shadow hover:shadow-md">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">{task.title}</h4>
            <Badge
              variant={
                task.priority === "high"
                  ? "destructive"
                  : task.priority === "medium"
                    ? "default"
                    : "secondary"
              }
              className="pointer-events-none rounded-sm capitalize"
            >
              {task.priority}
            </Badge>
          </div>
          {task.description && (
            <p className="text-muted-foreground text-sm">{task.description}</p>
          )}
          <div className="flex items-center justify-between text-muted-foreground text-xs">
            {task.assignee && <span>{task.assignee}</span>}
            {task.dueDate && <span>{task.dueDate}</span>}
          </div>
        </div>
      </div>
    </Kanban.Item>
  );
}

interface TaskColumnProps
  extends Omit<
    React.ComponentProps<typeof Kanban.Column>,
    "value" | "children"
  > {
  columnId: string;
  tasks: Task[];
}

function TaskColumn({ columnId, tasks, ...props }: TaskColumnProps) {
  return (
    <Kanban.Column key={columnId} value={columnId} {...props}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold">{COLUMN_TITLES[columnId]}</h3>
          <Badge variant="secondary" className="pointer-events-none rounded-sm">
            {tasks?.length ?? 0}
          </Badge>
        </div>
        <Kanban.ColumnHandle asChild>
          <Button variant="ghost" size="icon">
            <GripVertical className="h-4 w-4" />
          </Button>
        </Kanban.ColumnHandle>
      </div>
      <div className="flex flex-col gap-2 p-0.5">
        {tasks?.map((task) => (
          <TaskCard key={task.id} task={task} asHandle />
        ))}
      </div>
    </Kanban.Column>
  );
}
