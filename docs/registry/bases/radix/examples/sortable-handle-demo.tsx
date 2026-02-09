"use client";

import { GripVertical } from "lucide-react";
import * as React from "react";
import { Button } from "@/components/ui/button";
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
  SortableItemHandle,
  SortableOverlay,
} from "@/registry/bases/radix/ui/sortable";

export default function SortableHandleDemo() {
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
    <Sortable
      value={tricks}
      onValueChange={setTricks}
      getItemValue={(item) => item.id}
    >
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
                    <SortableItemHandle asChild>
                      <Button variant="ghost" size="icon" className="size-8">
                        <GripVertical className="h-4 w-4" />
                      </Button>
                    </SortableItemHandle>
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
        <div className="size-full rounded-none bg-primary/10" />
      </SortableOverlay>
    </Sortable>
  );
}
