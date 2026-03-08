// Componente Grid - Renderizador 10x10 base
"use client";

import React from "react";
import { Cell } from "./Cell";
import { CellState } from "@/types/game-enums";
import { GRID_SIZE } from "@/lib/constants";

interface GridProps {
  grid: CellState[][];
  onCellClick?: (row: number, col: number) => void;
  onCellHover?: (row: number, col: number) => void;
  onCellLeave?: () => void;
  readOnly?: boolean;
  showShips?: boolean;
  animatingCell?: { row: number; col: number; type: "hit" | "miss" } | null;
  previewCells?: { x: number; y: number; isValid: boolean }[];
  highlightedCells?: Set<string>;
}

export const Grid: React.FC<GridProps> = ({
  grid,
  onCellClick,
  onCellHover,
  onCellLeave,
  readOnly = false,
  showShips = true,
  animatingCell = null,
  previewCells = [],
  highlightedCells,
}) => {
  const getPreviewState = (col: number, row: number) => {
    const preview = previewCells.find((p) => p.x === col && p.y === row);
    if (preview) return { isPreview: true, isValid: preview.isValid };

    const highlighted = highlightedCells?.has(`${row}-${col}`) ?? false;
    return { isPreview: highlighted, isValid: true };
  };

  return (
    <div className="relative p-4 md:p-8 bg-slate-900/50 rounded-xl border border-slate-800 shadow-2xl backdrop-blur-md select-none inline-block">
      <div>
        <div className="flex">
          <div className="w-8 h-8 md:w-10 md:h-10" />
          {Array.from({ length: GRID_SIZE }, (_, i) => (
            <div
              key={i}
              className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center text-slate-400 font-bold text-xs md:text-sm"
            >
              {String.fromCharCode(65 + i)}
            </div>
          ))}
        </div>

        {grid.map((row, rowIndex) => (
          <div key={rowIndex} className="flex">
            <div className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center text-slate-400 font-bold text-xs md:text-sm">
              {rowIndex + 1}
            </div>

            {row.map((cellState, colIndex) => {
              const { isPreview, isValid } = getPreviewState(colIndex, rowIndex);

              return (
                <Cell
                  key={`${rowIndex}-${colIndex}`}
                  state={cellState}
                  onClick={() => onCellClick?.(rowIndex, colIndex)}
                  onMouseEnter={() => onCellHover?.(rowIndex, colIndex)}
                  onMouseLeave={onCellLeave}
                  disabled={readOnly}
                  showShip={showShips}
                  isAnimating={
                    animatingCell &&
                    animatingCell.row === rowIndex &&
                    animatingCell.col === colIndex
                      ? animatingCell.type
                      : null
                  }
                  isPreview={isPreview}
                  isValidPreview={isValid}
                />
              );
            })}
          </div>
        ))}
      </div>

      <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-cyan-500/50 rounded-tl-lg m-2 pointer-events-none"></div>
      <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-cyan-500/50 rounded-tr-lg m-2 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-cyan-500/50 rounded-bl-lg m-2 pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-cyan-500/50 rounded-br-lg m-2 pointer-events-none"></div>
    </div>
  );
};
