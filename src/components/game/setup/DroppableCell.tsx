/**
 * DroppableCell — Grid cell that accepts ship drops via @dnd-kit.
 *
 * Wraps a visual cell with `useDroppable`. The droppable `id` follows
 * the convention `cell-{x}-{y}` so the parent `DndContext` can parse
 * the target coordinates on `DragEnd`.
 */
"use client";

import React from "react";
import { useDroppable } from "@dnd-kit/core";
import { CELL_SIZE } from "@/lib/game-rules";
import { cn } from "@/lib/utils";

// ─── Props ───────────────────────────────────────────────────────────────────

export interface DroppableCellProps {
  x: number;
  y: number;
  /** Visual feedback: true = valid drop target, false = invalid. null = neutral. */
  isValid?: boolean | null;
  onClick?: (x: number, y: number) => void;
}

// ─── Component ───────────────────────────────────────────────────────────────

export const DroppableCell: React.FC<DroppableCellProps> = ({
  x,
  y,
  isValid = null,
  onClick,
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: `cell-${x}-${y}`,
    data: { x, y },
  });

  // Determine highlight colour
  let highlight = "";
  if (isOver && isValid === true) highlight = "bg-emerald-500/40";
  if (isOver && isValid === false) highlight = "bg-red-500/40";
  if (isOver && isValid === null) highlight = "bg-naval-action/20";

  return (
    <div
      ref={setNodeRef}
      role="button"
      tabIndex={-1}
      onClick={() => onClick?.(x, y)}
      style={{ width: CELL_SIZE, height: CELL_SIZE }}
      className={cn(
        "border border-naval-border/60 transition-colors duration-100",
        "bg-naval-bg/80 hover:bg-naval-action/10",
        highlight,
      )}
      data-x={x}
      data-y={y}
    />
  );
};
