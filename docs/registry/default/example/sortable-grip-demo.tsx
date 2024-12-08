"use client";

import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Sortable,
  SortableContent,
  SortableItem,
  SortableItemGrip,
  SortableOverlay,
} from "@/registry/default/ui/sortable";
import { GripVertical } from "lucide-react";
import * as React from "react";

export default function SortableGripDemo() {
  const [tricks, setTricks] = React.useState([
    { id: "1", title: "The 900", difficulty: "Expert", points: 9000 },
    { id: "2", title: "Indy Backflip", difficulty: "Advanced", points: 4000 },
    { id: "3", title: "Pizza Guy", difficulty: "Intermediate", points: 1500 },
    {
      id: "4",
      title: "360 Varial McTwist",
      difficulty: "Expert",
      points: 5000,
    },
  ]);

  return (
    <Sortable value={tricks} onValueChange={setTricks}>
      <Table className="rounded-none border">
        <TableHeader>
          <TableRow className="bg-accent/50">
            <TableHead className="w-[50px] bg-transparent" />
            <TableHead className="bg-transparent">Trick</TableHead>
            <TableHead className="bg-transparent">Difficulty</TableHead>
            <TableHead className="bg-transparent text-right">Points</TableHead>
          </TableRow>
        </TableHeader>
        <SortableContent asChild>
          <TableBody>
            {tricks.map((trick) => (
              <SortableItem key={trick.id} value={trick.id} asChild>
                <TableRow>
                  <TableCell className="w-[50px]">
                    <SortableItemGrip
                      variant="ghost"
                      size="icon"
                      className="size-8"
                    >
                      <GripVertical className="h-4 w-4" />
                    </SortableItemGrip>
                  </TableCell>
                  <TableCell className="font-medium">{trick.title}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {trick.difficulty}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {trick.points}
                  </TableCell>
                </TableRow>
              </SortableItem>
            ))}
          </TableBody>
        </SortableContent>
      </Table>
      <SortableOverlay>
        <Skeleton className="size-full rounded-none" />
      </SortableOverlay>
    </Sortable>
  );
}