/**
 * SetupGrid — 10×10 tactical grid for the ship-placement phase.
 *
 * Responsibilities:
 *  • Render labelled column (A-J) and row (1-10) headers.
 *  • Render each cell with optional `isOver` / `isValid` highlights
 *    (prepared for future drag-and-drop integration).
 *  • Act as a positioning context (`position: relative`) so that
 *    placed ships can be overlaid with absolute positioning.
 *
 * No game logic or drag-and-drop code lives here — it's visual only.
 */
"use client";

import React from "react";
import { GRID_SIZE, CELL_SIZE } from "@/lib/game-rules";
import { cn } from "@/lib/utils";

// ─── Cell Props ──────────────────────────────────────────────────────────────

export interface SetupCellProps {
  /** Column index (0-based). */
  x: number;
  /** Row index (0-based). */
  y: number;
  /** True when a dragged item is hovering over this cell. */
  isOver?: boolean;
  /** Placement validity while hovering (null when nothing is dragged). */
  isValid?: boolean | null;
  /** Callback when the user clicks this cell. */
  onClick?: (x: number, y: number) => void;
}

// ─── Single Cell ─────────────────────────────────────────────────────────────

const SetupCell: React.FC<SetupCellProps> = ({
  x,
  y,
  isOver = false,
  isValid = null,
  onClick,
}) => {
  // Determine highlight colour
  let highlight = "";
  if (isOver && isValid === true) highlight = "bg-emerald-500/40";
  if (isOver && isValid === false) highlight = "bg-red-500/40";

  return (
    <button
      type="button"
      onClick={() => onClick?.(x, y)}
      style={{ width: CELL_SIZE, height: CELL_SIZE }}
      className={cn(
        "border border-naval-border/60 transition-colors duration-100",
        // default water colour
        "bg-naval-bg/80 hover:bg-naval-action/20",
        // drop highlight overrides
        highlight,
      )}
      data-x={x}
      data-y={y}
    />
  );
};

// ─── Grid Props ──────────────────────────────────────────────────────────────

export interface SetupGridProps {
  /** Map of "x,y" → { isOver, isValid } for cells that need highlighting. */
  highlights?: Map<string, { isOver: boolean; isValid: boolean }>;
  /** Forwarded to every cell. */
  onCellClick?: (x: number, y: number) => void;
  /** Extra content rendered inside the positioning context (e.g. placed ships). */
  children?: React.ReactNode;
}

// ─── Header constants ────────────────────────────────────────────────────────

const HEADER_SIZE = 28; // px — width/height for the row/column label cells.

const COL_LABELS = Array.from({ length: GRID_SIZE }, (_, i) =>
  String.fromCharCode(65 + i),
);

// ─── Component ───────────────────────────────────────────────────────────────

export const SetupGrid: React.FC<SetupGridProps> = ({
  highlights,
  onCellClick,
  children,
}) => {
  /** Total pixel width/height of the cell area (used for the relative wrapper). */
  const gridPx = GRID_SIZE * CELL_SIZE;

  return (
    <div className="inline-flex flex-col select-none">
      {/* ── Column headers (A-J) ──────────────────────────────────────── */}
      <div className="flex" style={{ paddingLeft: HEADER_SIZE }}>
        {COL_LABELS.map((letter) => (
          <div
            key={letter}
            style={{ width: CELL_SIZE, height: HEADER_SIZE }}
            className="flex items-center justify-center text-xs font-bold text-naval-text-secondary"
          >
            {letter}
          </div>
        ))}
      </div>

      <div className="flex">
        {/* ── Row headers (1-10) ────────────────────────────────────────── */}
        <div className="flex flex-col">
          {Array.from({ length: GRID_SIZE }, (_, i) => (
            <div
              key={i}
              style={{ width: HEADER_SIZE, height: CELL_SIZE }}
              className="flex items-center justify-center text-xs font-bold text-naval-text-secondary"
            >
              {i + 1}
            </div>
          ))}
        </div>

        {/* ── Cell area — relative context for absolute ship overlays ── */}
        <div className="relative" style={{ width: gridPx, height: gridPx }}>
          {/* Background grid of cells */}
          <div
            className="absolute inset-0 grid"
            style={{
              gridTemplateColumns: `repeat(${GRID_SIZE}, ${CELL_SIZE}px)`,
              gridTemplateRows: `repeat(${GRID_SIZE}, ${CELL_SIZE}px)`,
            }}
          >
            {Array.from({ length: GRID_SIZE }, (_, y) =>
              Array.from({ length: GRID_SIZE }, (_, x) => {
                const key = `${x},${y}`;
                const hl = highlights?.get(key);

                return (
                  <SetupCell
                    key={key}
                    x={x}
                    y={y}
                    isOver={hl?.isOver}
                    isValid={hl?.isValid}
                    onClick={onCellClick}
                  />
                );
              }),
            )}
          </div>

          {/* Ship overlays & future drop previews */}
          {children}
        </div>
      </div>
    </div>
  );
};
