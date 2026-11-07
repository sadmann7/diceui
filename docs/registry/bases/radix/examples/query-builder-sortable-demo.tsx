"use client";

import {
  type ClientRect,
  closestCenter,
  type CollisionDetection,
  type DragOverEvent,
  MeasuringStrategy,
  type Modifier,
  pointerWithin,
  rectIntersection,
  type UniqueIdentifier,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { GripVerticalIcon, PlusIcon } from "lucide-react";
import * as React from "react";

import {
  findQueryNode,
  getIsQueryGroup,
  moveQueryNode,
  type QueryField,
  type QueryGroup,
  type QueryNode,
} from "@/registry/bases/radix/lib/query-builder";
import { Button } from "@/registry/bases/radix/ui/button";
import { ButtonGroup } from "@/registry/bases/radix/ui/button-group";
import {
  QueryBuilder,
  QueryBuilderAddGroup,
  QueryBuilderAddRule,
  QueryBuilderConnector,
  QueryBuilderField,
  QueryBuilderGroup,
  QueryBuilderGroupContent,
  QueryBuilderGroupFooter,
  QueryBuilderGroupHeader,
  QueryBuilderGroupTitle,
  QueryBuilderOperator,
  QueryBuilderRemove,
  QueryBuilderRule,
  QueryBuilderRules,
  QueryBuilderValue,
} from "@/registry/bases/radix/ui/query-builder";
import {
  Sortable,
  SortableContent,
  SortableItem,
  SortableItemHandle,
  SortableOverlay,
} from "@/registry/bases/radix/ui/sortable";

const fields: QueryField[] = [
  { name: "title", label: "Title", type: "text" },
  {
    name: "status",
    label: "Status",
    type: "select",
    options: [
      { label: "Todo", value: "todo" },
      { label: "In progress", value: "in-progress" },
      { label: "Done", value: "done" },
    ],
  },
  { name: "estimate", label: "Estimate", type: "number" },
  { name: "dueDate", label: "Due date", type: "date" },
];

const defaultQuery: QueryGroup = {
  id: "root",
  combinator: "and",
  rules: [
    { id: "status", field: "status", operator: "eq", value: "todo" },
    {
      id: "group",
      combinator: "or",
      rules: [
        { id: "estimate", field: "estimate", operator: "gte", value: "5" },
        { id: "dueDate", field: "dueDate", operator: "isEmpty" },
      ],
    },
    { id: "title", field: "title", operator: "iLike", value: "kickflip" },
  ],
};

const OVERLAY_ID = "overlay";

function getNodes(group: QueryGroup): QueryNode[] {
  return group.rules.flatMap((node) =>
    getIsQueryGroup(node) ? [node, ...getNodes(node)] : [node],
  );
}

function getParent(root: QueryGroup, id: string): QueryGroup | undefined {
  for (const node of root.rules) {
    if (node.id === id) return root;
    if (getIsQueryGroup(node)) {
      const parent = getParent(node, id);
      if (parent) return parent;
    }
  }
  return undefined;
}

function getIsInside(root: QueryGroup, id: string, ancestorId: string) {
  const ancestor = findQueryNode(root, ancestorId);
  return (
    !!ancestor && getIsQueryGroup(ancestor) && !!findQueryNode(ancestor, id)
  );
}

function getPointerY({ active, activatorEvent }: DragOverEvent) {
  const { initial, translated } = active.rect.current;
  if (!initial || !translated) return undefined;
  const touch =
    "touches" in activatorEvent && (activatorEvent as TouchEvent).touches[0];
  const startY =
    activatorEvent instanceof MouseEvent
      ? activatorEvent.clientY
      : touch
        ? touch.clientY
        : initial.top + initial.height / 2;
  return translated.top + startY - initial.top;
}

function QueryBuilderSortableHandle({
  label,
  variant = "outline",
}: {
  label: string;
  variant?: "outline" | "ghost";
}) {
  return (
    <SortableItemHandle asChild>
      <Button
        variant={variant}
        size="icon-sm"
        aria-label={label}
        className="text-muted-foreground"
      >
        <GripVerticalIcon />
      </Button>
    </SortableItemHandle>
  );
}

function QueryBuilderSortableNode({ node }: { node: QueryNode }) {
  if (getIsQueryGroup(node)) {
    return (
      <SortableItem value={node.id} asChild>
        <QueryBuilderGroup className="data-dragging:opacity-0" />
      </SortableItem>
    );
  }

  return (
    <SortableItem value={node.id} asChild>
      <QueryBuilderRule className="data-dragging:opacity-0">
        <QueryBuilderConnector />
        <ButtonGroup>
          <QueryBuilderField />
          <QueryBuilderOperator />
          <QueryBuilderValue />
          <QueryBuilderRemove variant="outline" />
          <QueryBuilderSortableHandle label="Move rule" />
        </ButtonGroup>
      </QueryBuilderRule>
    </SortableItem>
  );
}

function QueryBuilderSortableLayout({
  group,
  rootId,
}: {
  group: QueryGroup;
  rootId: string;
}) {
  return (
    <>
      <QueryBuilderConnector />
      <QueryBuilderGroupContent>
        <QueryBuilderGroupHeader className="data-[depth=0]:hidden">
          <QueryBuilderGroupTitle />
          <QueryBuilderAddRule size="icon-sm" aria-label="Add rule">
            <PlusIcon />
          </QueryBuilderAddRule>
          <QueryBuilderRemove />
          {group.id !== rootId && (
            <QueryBuilderSortableHandle label="Move group" variant="ghost" />
          )}
        </QueryBuilderGroupHeader>
        <SortableContext
          items={group.rules.map((node) => node.id)}
          strategy={verticalListSortingStrategy}
        >
          <QueryBuilderRules>
            {(node) => <QueryBuilderSortableNode node={node} />}
          </QueryBuilderRules>
        </SortableContext>
        {group.id === rootId && rootId !== OVERLAY_ID && (
          <QueryBuilderGroupFooter>
            <QueryBuilderAddRule />
            <QueryBuilderAddGroup />
          </QueryBuilderGroupFooter>
        )}
      </QueryBuilderGroupContent>
    </>
  );
}

export default function QueryBuilderSortableDemo() {
  const [query, setQuery] = React.useState(defaultQuery);
  const queryBuilderRef = React.useRef<HTMLDivElement>(null);
  const [activeId, setActiveId] = React.useState<string | null>(null);
  const [activeRect, setActiveRect] = React.useState<ClientRect | null>(null);
  const queryBeforeDragRef = React.useRef<QueryGroup | null>(null);
  const rectsRef = React.useRef<Map<UniqueIdentifier, ClientRect>>(new Map());
  const lastOverIdRef = React.useRef<UniqueIdentifier | null>(null);
  const movedRef = React.useRef(false);

  const collisionDetection: CollisionDetection = (args) => {
    rectsRef.current = args.droppableRects;
    const id = String(args.active.id);
    const droppableContainers = args.droppableContainers.filter(
      (container) =>
        container.id === args.active.id ||
        !getIsInside(query, String(container.id), id),
    );
    const pointerCollisions = pointerWithin({ ...args, droppableContainers });
    const collisions =
      pointerCollisions.length > 0
        ? pointerCollisions
        : rectIntersection({ ...args, droppableContainers });
    const getArea = (key: UniqueIdentifier) => {
      const rect = args.droppableRects.get(key);
      return rect ? rect.width * rect.height : Number.POSITIVE_INFINITY;
    };
    let overId = [...collisions].sort(
      (a, b) => getArea(a.id) - getArea(b.id),
    )[0]?.id;

    if (overId != null) {
      const node = findQueryNode(query, String(overId));
      if (node && getIsQueryGroup(node) && overId !== args.active.id) {
        const children = node.rules.map((rule) => rule.id);
        const firstRect = children[0]
          ? args.droppableRects.get(children[0])
          : undefined;
        const lastRect = children.at(-1)
          ? args.droppableRects.get(children.at(-1) as string)
          : undefined;
        const y = args.pointerCoordinates?.y;
        const isOutside =
          y !== undefined &&
          ((!!firstRect && y < firstRect.top) ||
            (!!lastRect && y > lastRect.top + lastRect.height));
        if (children.length > 0 && !isOutside) {
          overId =
            closestCenter({
              ...args,
              droppableContainers: droppableContainers.filter((container) =>
                children.includes(String(container.id)),
              ),
            })[0]?.id ?? overId;
        }
      }
      lastOverIdRef.current = overId;
      return [{ id: overId }];
    }

    if (movedRef.current) lastOverIdRef.current = args.active.id;
    return lastOverIdRef.current != null ? [{ id: lastOverIdRef.current }] : [];
  };

  const restrictToQueryBuilder: Modifier = ({
    transform,
    active,
    activeNodeRect,
    draggingNodeRect,
  }) => {
    const bounds = queryBuilderRef.current?.getBoundingClientRect();
    const initial = active?.rect.current.initial ?? activeNodeRect;
    if (!bounds || !active || !initial) return { ...transform, x: 0 };
    const rect = rectsRef.current.get(active.id) ?? initial;
    const height = draggingNodeRect?.height ?? initial.height;
    const min = bounds.top - initial.top;
    const max = bounds.bottom - initial.top - height;
    return {
      ...transform,
      x: rect.left - initial.left,
      y: Math.min(Math.max(transform.y, min), max),
    };
  };

  const onDragMove = ({ active }: DragOverEvent) => {
    const rect = rectsRef.current.get(active.id);
    if (!rect) return;
    setActiveRect((current) =>
      current?.left === rect.left && current?.width === rect.width
        ? current
        : rect,
    );
  };

  const onDragOver = (event: DragOverEvent) => {
    onDragMove(event);
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const activeKey = String(active.id);
    const overKey = String(over.id);
    const overNode = findQueryNode(query, overKey);
    const from = getParent(query, activeKey);
    const to =
      overNode && getIsQueryGroup(overNode) && overNode.rules.length === 0
        ? overNode
        : getParent(query, overKey);
    if (!from || !to || from.id === to.id) return;
    const overIndex = to.rules.findIndex((node) => node.id === overKey);
    const y = getPointerY(event);
    const isBelow = y !== undefined && y > over.rect.top + over.rect.height / 2;
    movedRef.current = true;
    requestAnimationFrame(() => {
      movedRef.current = false;
    });
    setQuery(
      moveQueryNode(
        query,
        activeKey,
        to.id,
        overIndex === -1 ? to.rules.length : overIndex + (isBelow ? 1 : 0),
      ),
    );
  };

  const onDragReset = () => {
    setActiveId(null);
    setActiveRect(null);
    queryBeforeDragRef.current = null;
    lastOverIdRef.current = null;
  };

  const activeNode = activeId ? findQueryNode(query, activeId) : undefined;

  return (
    <Sortable
      value={getNodes(query)}
      getItemValue={(node: QueryNode) => node.id}
      modifiers={[restrictToQueryBuilder]}
      collisionDetection={collisionDetection}
      autoScroll={false}
      measuring={{ droppable: { strategy: MeasuringStrategy.Always } }}
      onDragStart={({ active }) => {
        queryBeforeDragRef.current = query;
        setActiveId(String(active.id));
      }}
      onDragMove={onDragMove}
      onDragOver={onDragOver}
      onDragCancel={() => {
        if (queryBeforeDragRef.current) setQuery(queryBeforeDragRef.current);
        onDragReset();
      }}
      onDragEnd={({ active, over }) => {
        if (over && active.id !== over.id) {
          const activeKey = String(active.id);
          const overKey = String(over.id);
          setQuery((current) => {
            const parent = getParent(current, activeKey);
            if (!parent || parent.id !== getParent(current, overKey)?.id) {
              return current;
            }
            const index = parent.rules.findIndex((node) => node.id === overKey);
            return moveQueryNode(current, activeKey, parent.id, index);
          });
        }
        onDragReset();
      }}
    >
      <SortableContent withoutSlot>
        <QueryBuilder
          ref={queryBuilderRef}
          fields={fields}
          value={query}
          onValueChange={setQuery}
          className="w-full max-w-lg"
        >
          <QueryBuilderGroup>
            {(group) => (
              <QueryBuilderSortableLayout group={group} rootId={query.id} />
            )}
          </QueryBuilderGroup>
        </QueryBuilder>
      </SortableContent>
      <SortableOverlay
        style={
          activeRect ? { width: activeRect.width, height: "auto" } : undefined
        }
      >
        {activeNode && (
          <QueryBuilder
            fields={fields}
            value={{ id: OVERLAY_ID, combinator: "and", rules: [activeNode] }}
          >
            <QueryBuilderGroup>
              {(group) => (
                <QueryBuilderSortableLayout group={group} rootId={OVERLAY_ID} />
              )}
            </QueryBuilderGroup>
          </QueryBuilder>
        )}
      </SortableOverlay>
    </Sortable>
  );
}
