/**
 * ShipDock — Sidebar listing the ships still available for placement.
 *
 * Reads `availableShips` from the setup store and renders a vertical
 * list of `ShipUnit` cards. No drag-and-drop yet — each card is
 * click-selectable to prepare for future interaction.
 */
"use client";

import React from "react";
import { useSetupStore } from "@/stores/useSetupStore";
import { FLEET_CONFIG } from "@/lib/game-rules";
import { ShipUnit } from "./ShipUnit";
import { cn } from "@/lib/utils";

// ─── Props ───────────────────────────────────────────────────────────────────

export interface ShipDockProps {
  /** Id of the currently selected ship (highlight). */
  selectedShipId?: string | null;
  /** Called when the user clicks a dock ship. */
  onSelect?: (shipId: string) => void;
  /** Extra classes on the root container. */
  className?: string;
}

// ─── Component ───────────────────────────────────────────────────────────────

export const ShipDock: React.FC<ShipDockProps> = ({
  selectedShipId,
  onSelect,
  className,
}) => {
  const availableShips = useSetupStore((s) => s.availableShips);

  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-xl border border-naval-border bg-naval-surface/80 p-4",
        className,
      )}
    >
      {/* Header */}
      <h2 className="text-sm font-bold uppercase tracking-widest text-naval-text-secondary">
        Porto de Guerra
      </h2>

      {availableShips.length === 0 && (
        <p className="text-xs text-naval-text-muted italic">
          Todos os navios foram posicionados.
        </p>
      )}

      {/* Ship list */}
      <div className="flex flex-col gap-4">
        {availableShips.map((ship) => {
          const config = FLEET_CONFIG[ship.type];
          const isSelected = ship.id === selectedShipId;

          return (
            <button
              key={ship.id}
              type="button"
              onClick={() => onSelect?.(ship.id)}
              className={cn(
                "flex flex-col items-start gap-1 rounded-lg p-3 transition-colors",
                "hover:bg-naval-action/10",
                isSelected
                  ? "ring-2 ring-naval-action bg-naval-action/10"
                  : "bg-naval-bg/40",
              )}
            >
              {/* Label + size */}
              <span className="text-xs font-semibold text-naval-text-primary">
                {config.label}
                <span className="ml-1.5 text-naval-text-muted font-normal">
                  ({config.size} casas)
                </span>
              </span>

              {/* Visual ship preview */}
              <ShipUnit
                type={ship.type}
                size={ship.size}
                orientation={ship.orientation}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
};
