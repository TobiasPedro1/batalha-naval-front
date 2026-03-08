// Componente Cell - Célula individual do tabuleiro
"use client";

import React from "react";
import { CellState } from "@/types/game-enums";
import { cn } from "@/lib/utils";
import { Ship, Waves } from "lucide-react";

interface CellProps {
  state: CellState;
  onClick?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  disabled?: boolean;
  showShip?: boolean;
  isAnimating?: "hit" | "miss" | null;
  isPreview?: boolean;
  isValidPreview?: boolean;
  isHighlighted?: boolean;
}

export const Cell: React.FC<CellProps> = ({
  state,
  onClick,
  onMouseEnter,
  onMouseLeave,
  disabled = false,
  showShip = true,
  isAnimating = null,
  isPreview = false,
  isValidPreview = true,
  isHighlighted = false,
}) => {
  const getCellStyle = () => {
    if (state === CellState.HIT)
      return "bg-gradient-to-br from-red-500 via-orange-500 to-red-700 border-red-400 shadow-[inset_0_0_8px_rgba(239,68,68,0.6)]";

    if (state === CellState.MISS)
      return "bg-gradient-to-br from-cyan-500 via-blue-500 to-blue-600 border-cyan-500";

    if (isPreview) {
      return isValidPreview
        ? "bg-emerald-500/50 border-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.3)]"
        : "bg-red-500/50 border-red-400 shadow-[0_0_10px_rgba(239,68,68,0.3)]";
    }

    if (state === CellState.SHIP && showShip)
      return "bg-slate-600 border-slate-500 shadow-inner";

    return "bg-blue-500/10 border-blue-500/20 hover:bg-blue-500/20 hover:border-blue-400/30";
  };

  const getCellContent = () => {
    if (state === CellState.HIT) {
      return <Ship className="w-4 h-4 text-yellow-100 drop-shadow-[0_0_4px_rgba(250,204,21,0.8)]" />;
    }

    if (state === CellState.MISS) {
      return <Waves className="w-4 h-4 text-cyan-100 drop-shadow-[0_0_4px_rgba(125,211,252,0.8)]" />;
    }

    if (state === CellState.SHIP && showShip) {
      return <Ship className="w-4 h-4 text-slate-300/80" />;
    }

    return null;
  };

  return (
    <button
      className={cn(
        "w-8 h-8 md:w-10 md:h-10 border flex items-center justify-center relative transition-all duration-200",
        getCellStyle(),
        isHighlighted && "ring-2 ring-cyan-400 ring-inset z-10 brightness-125",
        !disabled && "cursor-pointer hover:brightness-110",
        disabled && "cursor-not-allowed opacity-90",
        isAnimating === "hit" && "animate-hit-explosion",
        isAnimating === "miss" && "animate-miss-splash",
      )}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      disabled={disabled}
      type="button"
      aria-label="Grid Cell"
    >
      {getCellContent()}
    </button>
  );
};
