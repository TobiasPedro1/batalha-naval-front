/**
 * ShipUnit — Pure visual representation of a single ship.
 *
 * Renders a row (horizontal) or column (vertical) of cells whose total
 * length equals `size * CELL_SIZE`. No drag logic belongs here.
 */
"use client";

import React from "react";
import { ShipType, ShipOrientation } from "@/types/game-enums";
import { FLEET_CONFIG, CELL_SIZE } from "@/lib/game-rules";
import { cn } from "@/lib/utils";

// ─── Visual mapping per ship type ────────────────────────────────────────────

const SHIP_COLOURS: Record<ShipType, string> = {
  [ShipType.PORTA_AVIAO_A]: "bg-slate-500",
  [ShipType.PORTA_AVIAO_B]: "bg-slate-600",
  [ShipType.NAVIO_GUERRA_A]: "bg-sky-700",
  [ShipType.NAVIO_GUERRA_B]: "bg-sky-800",
  [ShipType.ENCOURACADO]: "bg-zinc-500",
  [ShipType.SUBMARINO]: "bg-emerald-700",
};

const SHIP_ACCENT: Record<ShipType, string> = {
  [ShipType.PORTA_AVIAO_A]: "border-slate-300",
  [ShipType.PORTA_AVIAO_B]: "border-slate-400",
  [ShipType.NAVIO_GUERRA_A]: "border-sky-400",
  [ShipType.NAVIO_GUERRA_B]: "border-sky-500",
  [ShipType.ENCOURACADO]: "border-zinc-300",
  [ShipType.SUBMARINO]: "border-emerald-400",
};

// ─── Props ───────────────────────────────────────────────────────────────────

export interface ShipUnitProps {
  type: ShipType;
  size: number;
  orientation: ShipOrientation;
  /** Extra Tailwind classes forwarded to the root element. */
  className?: string;
  /** When true, the ship is rendered at reduced opacity (already placed). */
  ghost?: boolean;
}

// ─── Component ───────────────────────────────────────────────────────────────

export const ShipUnit: React.FC<ShipUnitProps> = ({
  type,
  size,
  orientation,
  className,
  ghost = false,
}) => {
  const isHorizontal = orientation === ShipOrientation.HORIZONTAL;
  const config = FLEET_CONFIG[type];

  const containerStyle: React.CSSProperties = {
    width: isHorizontal ? size * CELL_SIZE : CELL_SIZE,
    height: isHorizontal ? CELL_SIZE : size * CELL_SIZE,
  };

  return (
    <div
      title={config.label}
      style={containerStyle}
      className={cn(
        "flex select-none",
        isHorizontal ? "flex-row" : "flex-col",
        ghost && "opacity-40",
        className,
      )}
    >
      {Array.from({ length: size }, (_, i) => {
        const isFirst = i === 0;
        const isLast = i === size - 1;

        return (
          <div
            key={i}
            style={{ width: CELL_SIZE, height: CELL_SIZE }}
            className={cn(
              // base
              "border box-border flex items-center justify-center",
              SHIP_COLOURS[type],
              SHIP_ACCENT[type],
              // rounded bow / stern
              isHorizontal && isFirst && "rounded-l-md",
              isHorizontal && isLast && "rounded-r-md",
              !isHorizontal && isFirst && "rounded-t-md",
              !isHorizontal && isLast && "rounded-b-md",
            )}
          >
            {/* Centre marker on the bridge cell */}
            {i === Math.floor(size / 2) && (
              <span className="block w-2 h-2 rounded-full bg-white/60" />
            )}
          </div>
        );
      })}
    </div>
  );
};
