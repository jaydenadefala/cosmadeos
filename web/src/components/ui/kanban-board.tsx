"use client";

import * as React from "react";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { MoreVertical } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export interface KanbanColumn {
  id: string;
  label: string;
}

/**
 * Board View — a named Universal Workspace Component
 * (04 Enterprise Architecture/enterprise-information-architecture.md) and an
 * explicit Drag & Drop surface (03 Design Principles/interaction-patterns.md:
 * "Supported in: ... Kanban ..."). Real pointer drag-and-drop via dnd-kit,
 * plus a "Move to…" dropdown on every card as a keyboard/screen-reader-safe
 * fallback — drag-and-drop alone would lock out users who can't drag
 * (Accessibility Interaction Standards).
 */
export function KanbanBoard<T extends { id: string }>({
  id = "kanban-board",
  columns,
  items,
  getColumnId,
  onMove,
  renderCard,
}: {
  /** Stable, unique-per-instance id — required if a page ever renders more than one board. */
  id?: string;
  columns: KanbanColumn[];
  items: T[];
  getColumnId: (item: T) => string;
  onMove: (itemId: string, toColumnId: string) => void;
  renderCard: (item: T) => React.ReactNode;
}) {
  const [activeId, setActiveId] = React.useState<string | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor),
  );

  const activeItem = items.find((item) => item.id === activeId);

  function handleDragStart(event: DragStartEvent) {
    setActiveId(String(event.active.id));
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveId(null);
    const { active, over } = event;
    if (!over) return;
    onMove(String(active.id), String(over.id));
  }

  return (
    <DndContext
      // Stable id required so dnd-kit's auto-generated aria-describedby
      // element id matches between server render and client hydration —
      // without this, Next.js SSR + dnd-kit produces a hydration mismatch.
      id={id}
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActiveId(null)}
    >
      <div className="flex h-full min-h-0 gap-4 overflow-x-auto p-4 sm:p-6">
        {columns.map((column) => (
          <KanbanColumnView
            key={column.id}
            column={column}
            columns={columns}
            items={items.filter((item) => getColumnId(item) === column.id)}
            renderCard={renderCard}
            onMove={onMove}
          />
        ))}
      </div>
      <DragOverlay>
        {activeItem ? (
          <div className="bg-card w-72 rounded-lg border p-3 shadow-lg">{renderCard(activeItem)}</div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

function KanbanColumnView<T extends { id: string }>({
  column,
  columns,
  items,
  renderCard,
  onMove,
}: {
  column: KanbanColumn;
  columns: KanbanColumn[];
  items: T[];
  renderCard: (item: T) => React.ReactNode;
  onMove: (itemId: string, toColumnId: string) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });

  return (
    <div className="flex w-72 shrink-0 flex-col gap-2">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-sm font-semibold">{column.label}</h3>
        <Badge variant="secondary">{items.length}</Badge>
      </div>
      <div
        ref={setNodeRef}
        className={cn(
          "flex min-h-24 flex-1 flex-col gap-2 rounded-lg border border-dashed p-2 transition-colors",
          isOver && "border-primary bg-accent/40",
        )}
      >
        {items.map((item) => (
          <KanbanCard
            key={item.id}
            item={item}
            columns={columns}
            currentColumnId={column.id}
            onMove={onMove}
          >
            {renderCard(item)}
          </KanbanCard>
        ))}
        {items.length === 0 ? (
          <p className="text-muted-foreground p-2 text-center text-xs">No items</p>
        ) : null}
      </div>
    </div>
  );
}

function KanbanCard<T extends { id: string }>({
  item,
  children,
  columns,
  currentColumnId,
  onMove,
}: {
  item: T;
  children: React.ReactNode;
  columns: KanbanColumn[];
  currentColumnId: string;
  onMove: (itemId: string, toColumnId: string) => void;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: item.id });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "bg-card group relative rounded-lg border p-3 pr-8 shadow-sm",
        isDragging && "opacity-40",
      )}
    >
      <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
        {children}
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-1 right-1 size-6 opacity-0 focus-visible:opacity-100 group-hover:opacity-100"
              aria-label="Move to another stage"
            />
          }
        >
          <MoreVertical className="size-3.5" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {columns
            .filter((c) => c.id !== currentColumnId)
            .map((c) => (
              <DropdownMenuItem key={c.id} onClick={() => onMove(item.id, c.id)}>
                Move to {c.label}
              </DropdownMenuItem>
            ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
