"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Sortable,
  SortableContent,
  SortableItem,
  SortableItemGrip,
  SortableOverlay,
} from "@/registry/default/ui/sortable";
import { GripVertical, Plus } from "lucide-react";
import * as React from "react";

interface Task {
  id: string;
  title: string;
  status: "todo" | "in-progress" | "done";
}

export default function SortableMultiContainerDemo() {
  const [tasks, setTasks] = React.useState<Task[]>([
    { id: "1", title: "Research new features", status: "todo" },
    { id: "2", title: "Design system updates", status: "todo" },
    { id: "3", title: "API integration", status: "in-progress" },
    { id: "4", title: "Documentation", status: "in-progress" },
    { id: "5", title: "Unit tests", status: "done" },
  ]);

  const columns = {
    todo: tasks.filter((task) => task.status === "todo"),
    "in-progress": tasks.filter((task) => task.status === "in-progress"),
    done: tasks.filter((task) => task.status === "done"),
  };

  function handleDrop(items: Task[], containerId: string) {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        items.find((item) => item.id === task.id)
          ? { ...task, status: containerId as Task["status"] }
          : task,
      ),
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {(Object.entries(columns) as [Task["status"], Task[]][]).map(
        ([status, items]) => (
          <Sortable
            key={status}
            value={items}
            onValueChange={(newItems) => handleDrop(newItems, status)}
            orientation="both"
          >
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold capitalize">
                  {status.replace("-", " ")}
                </h3>
                <Button variant="ghost" size="icon" className="size-8">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <SortableContent className="flex flex-col gap-2">
                {items.map((task) => (
                  <SortableItem key={task.id} value={task.id}>
                    <Card className="flex items-center gap-2 rounded-md p-3">
                      <SortableItemGrip asChild>
                        <Button variant="ghost" size="icon" className="size-8">
                          <GripVertical className="h-4 w-4" />
                        </Button>
                      </SortableItemGrip>
                      <span>{task.title}</span>
                    </Card>
                  </SortableItem>
                ))}
              </SortableContent>
            </div>
            <SortableOverlay>
              <Skeleton className="h-[52px] w-full rounded-lg" />
            </SortableOverlay>
          </Sortable>
        ),
      )}
    </div>
  );
}
