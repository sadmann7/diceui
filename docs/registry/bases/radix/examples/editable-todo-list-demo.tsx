"use client";

import { Edit, Trash2 } from "lucide-react";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import {
  Editable,
  EditableArea,
  EditableInput,
  EditablePreview,
  EditableTrigger,
} from "@/registry/bases/radix/ui/editable";

interface Todo {
  id: string;
  text: string;
  completed: boolean;
}

export default function EditableTodoListDemo() {
  const [todos, setTodos] = React.useState<Todo[]>([
    { id: "1", text: "Ollie", completed: false },
    { id: "2", text: "Kickflip", completed: false },
    { id: "3", text: "360 flip", completed: false },
    { id: "4", text: "540 flip", completed: false },
  ]);

  function onDeleteTodo(id: string) {
    setTodos((prev) => prev.filter((todo) => todo.id !== id));
  }

  function onToggleTodo(id: string) {
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo,
      ),
    );
  }

  function onUpdateTodo(id: string, newText: string) {
    setTodos((prev) =>
      prev.map((todo) => (todo.id === id ? { ...todo, text: newText } : todo)),
    );
  }

  return (
    <div className="flex w-full min-w-0 flex-col gap-2">
      <span className="font-semibold text-lg">Tricks to learn</span>
      {todos.map((todo) => (
        <div
          key={todo.id}
          className="flex items-center gap-2 rounded-lg border bg-card px-4 py-2"
        >
          <Checkbox
            checked={todo.completed}
            onCheckedChange={() => onToggleTodo(todo.id)}
          />
          <Editable
            key={todo.id}
            defaultValue={todo.text}
            onSubmit={(value) => onUpdateTodo(todo.id, value)}
            className="flex flex-1 flex-row items-center gap-1.5"
          >
            <EditableArea className="flex-1">
              <EditablePreview
                className={cn("w-full rounded-md px-1.5 py-1", {
                  "text-muted-foreground line-through": todo.completed,
                })}
              />
              <EditableInput className="px-1.5 py-1" />
            </EditableArea>
            <EditableTrigger asChild>
              <Button variant="ghost" size="icon" className="size-7">
                <Edit />
              </Button>
            </EditableTrigger>
          </Editable>
          <Button
            variant="ghost"
            size="icon"
            className="size-7 text-destructive"
            onClick={() => onDeleteTodo(todo.id)}
          >
            <Trash2 />
          </Button>
        </div>
      ))}
    </div>
  );
}
