/**
 * DraggableShip (Setup) — Wraps `ShipUnit` with @dnd-kit `useDraggable`.
 *
 * Used both in the **ShipDock** (available ships) and on the **board** (placed
 * ships). The `shipId` is used as the draggable id so the `DndContext` handler
 * can identify which ship is being moved.
 */
"use client";

import React from "react";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { ShipType, ShipOrientation } from "@/types/game-enums";
import { ShipUnit } from "./ShipUnit";

// ─── Props ───────────────────────────────────────────────────────────────────

export interface DraggableShipProps {
  /** Unique ship identifier (same as store id). */
  shipId: string;
  type: ShipType;
  size: number;
  orientation: ShipOrientation;
  /** When true the component is disabled (e.g. player already confirmed). */
  disabled?: boolean;
  /** Extra Tailwind classes on the wrapper. */
  className?: string;
}

// ─── Component ───────────────────────────────────────────────────────────────

export const DraggableShip: React.FC<DraggableShipProps> = ({
  shipId,
  type,
  size,
  orientation,
  disabled = false,
  className,
}) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: shipId,
      data: { shipId, type, size, orientation },
      disabled,
    });

  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    // While dragging the "origin" copy becomes invisible — the DragOverlay
    // renders the cursor-attached preview instead.
    opacity: isDragging ? 0 : 1,
    cursor: disabled ? "not-allowed" : "grab",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={className}
      {...listeners}
      {...attributes}
    >
      <ShipUnit type={type} size={size} orientation={orientation} />
    </div>
  );
};
