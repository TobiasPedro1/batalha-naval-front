/**
 * SetupPhase — Drag-and-drop ship placement orchestrator.
 *
 * Integrates:
 *  • `@dnd-kit/core` for drag interactions (Mouse + Touch sensors).
 *  • `useSetupStore` for placement logic & validation.
 *  • Visual components: SetupGrid, DroppableCell, DraggableShip, ShipUnit.
 *  • Global 'R' key listener for rotating the active / selected ship.
 *  • DragOverlay for a semi-transparent ship preview attached to the cursor.
 */
"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  DndContext,
  DragOverlay,
  DragStartEvent,
  DragEndEvent,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";

import { Anchor } from "lucide-react";
import { Match, SetupShipPayload } from "@/types/api-responses";
import { CELL_SIZE, FLEET_CONFIG, GRID_SIZE } from "@/lib/game-rules";
import {
  useSetupStore,
  type DockShip,
  type PlacedShip,
} from "@/stores/useSetupStore";
import { useSetupMatchMutation } from "@/hooks/queries/useMatchMutations";

import { SetupGrid } from "@/components/game/setup/SetupGrid";
import { DroppableCell } from "@/components/game/setup/DroppableCell";
import { DraggableShip } from "@/components/game/setup/DraggableShip";
import { ShipUnit } from "@/components/game/setup/ShipUnit";
import { Button } from "@/components/ui/Button";

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Parse a droppable id like `cell-3-7` → { x: 3, y: 7 }. */
function parseCellId(id: string): { x: number; y: number } | null {
  const m = /^cell-(\d+)-(\d+)$/.exec(id);
  if (!m) return null;
  return { x: Number(m[1]), y: Number(m[2]) };
}

/** Find a ship (dock or board) by id. */
function findShip(
  id: string,
  available: DockShip[],
  placed: PlacedShip[],
): DockShip | PlacedShip | undefined {
  return available.find((s) => s.id === id) ?? placed.find((s) => s.id === id);
}

// ─── Constants ──────────────────────────────────────────────────────────────

/** Natural px size of SetupGrid (cells + header labels). */
const GRID_NATURAL = GRID_SIZE * CELL_SIZE + 28;

// ─── Props ───────────────────────────────────────────────────────────────────

interface SetupPhaseProps {
  match: Match;
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function SetupPhase({ match }: SetupPhaseProps) {
  const router = useRouter();

  // ── Store ────────────────────────────────────────────────────────────────
  const availableShips = useSetupStore((s) => s.availableShips);
  const placedShips = useSetupStore((s) => s.placedShips);
  const placeShip = useSetupStore((s) => s.placeShip);
  const rotateShip = useSetupStore((s) => s.rotateShip);
  const removeShip = useSetupStore((s) => s.removeShip);
  const resetFleet = useSetupStore((s) => s.resetFleet);
  const allShipsPlaced = useSetupStore((s) => s.allShipsPlaced);

  // ── Mutation ─────────────────────────────────────────────────────────────
  const setupMatch = useSetupMatchMutation();

  // ── Local UI state ───────────────────────────────────────────────────────
  /** Id of the ship currently being dragged. */
  const [activeId, setActiveId] = useState<string | null>(null);
  /** Id of the currently "selected" ship (for click-to-place & rotation). */
  const [selectedId, setSelectedId] = useState<string | null>(null);

  /** The ship object corresponding to `activeId`. */
  const activeShip = activeId
    ? findShip(activeId, availableShips, placedShips)
    : undefined;

  // ── Sensors ──────────────────────────────────────────────────────────────
  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: { distance: 5 },
  });
  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: { delay: 150, tolerance: 5 },
  });
  const sensors = useSensors(mouseSensor, touchSensor);

  // ── Clean-up on unmount ──────────────────────────────────────────────────
  useEffect(() => {
    return () => resetFleet();
  }, [resetFleet]);

  // ── Keyboard: 'R' to rotate ─────────────────────────────────────────────
  // We track the "target" ship for rotation: activeId (while dragging) takes
  // priority, otherwise we fall back to selectedId.
  const rotationTarget = activeId ?? selectedId;
  const rotationTargetRef = useRef(rotationTarget);
  rotationTargetRef.current = rotationTarget;

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "r" || e.key === "R") {
        const id = rotationTargetRef.current;
        if (id) rotateShip(id);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [rotateShip]);

  // ── Validity highlights for the grid ─────────────────────────────────────
  // Build a Map<"x,y", { isOver, isValid }> that SetupGrid can consume to
  // colour cells while dragging.  We compute validity for every cell so the
  // grid can show green / red under the full ship silhouette.
  // (For now we pass `null` highlights — real-time preview would require
  //  tracking the pointer position via DragMove which adds complexity.
  //  DragOverlay already gives good visual feedback.)

  // ── Drag handlers ────────────────────────────────────────────────────────
  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(String(event.active.id));
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveId(null);

      if (!over) return; // dropped outside any cell

      const coords = parseCellId(String(over.id));
      if (!coords) return;

      const shipId = String(active.id);
      const ok = placeShip(shipId, coords.x, coords.y);

      if (!ok) {
        // Invalid drop — the store rejected it. The ship snaps back because
        // the DragOverlay disappears and the origin copy becomes visible again.
        console.warn(
          `Placement rejected for ${shipId} at (${coords.x}, ${coords.y})`,
        );
      }
    },
    [placeShip],
  );

  const handleDragCancel = useCallback(() => {
    setActiveId(null);
  }, []);

  // ── Click-to-place (fallback for non-drag interaction) ───────────────────
  const handleCellClick = useCallback(
    (x: number, y: number) => {
      if (!selectedId) return;
      const ok = placeShip(selectedId, x, y);
      if (ok) setSelectedId(null);
    },
    [selectedId, placeShip],
  );

  // ── Error toast state ────────────────────────────────────────────────────
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Auto-dismiss error toast after 4 seconds
  useEffect(() => {
    if (!errorMsg) return;
    const t = setTimeout(() => setErrorMsg(null), 4000);
    return () => clearTimeout(t);
  }, [errorMsg]);

  // ── Grid scaling ─────────────────────────────────────────────────────────
  const boardRef = useRef<HTMLDivElement>(null);
  const [gridScale, setGridScale] = useState(1);

  useEffect(() => {
    const el = boardRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      setGridScale(entry.contentRect.width / GRID_NATURAL);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // ── Confirm / submit fleet ───────────────────────────────────────────────
  /**
   * Maps `PlacedShip[]` → `SetupShipPayload[]` and sends to the backend.
   *
   * DTO mapping:
   *   name        → ShipType enum value (e.g. "Porta-Aviões")
   *   size        → number of cells
   *   startX      → column (ship.x)
   *   startY      → row    (ship.y)
   *   orientation → ShipOrientation string ("Horizontal" | "Vertical")
   */
  const handleConfirm = async () => {
    if (!allShipsPlaced()) return;

    setErrorMsg(null);

    try {
      const payload: SetupShipPayload[] = placedShips.map((ship) => ({
        name: ship.type, // ShipType enum value — matches backend string
        size: ship.size,
        startX: ship.x,
        startY: ship.y,
        orientation: ship.orientation, // ShipOrientation enum — "Horizontal" | "Vertical"
      }));

      await setupMatch.mutateAsync(payload);
    } catch (error: unknown) {
      const msg =
        error instanceof Error
          ? error.message
          : "Erro desconhecido ao enviar frota.";
      setErrorMsg(msg);
      console.error("Erro na sequência de confirmação:", error);
    }
  };

  // ── Derived ──────────────────────────────────────────────────────────────
  const isPlayerReady = match.player1.isReady || match.player2?.isReady;
  const isDeploying = setupMatch.isPending;
  const canConfirm = allShipsPlaced() && !isPlayerReady && !isDeploying;

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="flex flex-col items-center justify-center min-h-[80vh] w-full max-w-6xl mx-auto gap-8 p-4 animate-in fade-in duration-500">
        {/* ── Header ───────────────────────────────────────────────── */}
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold text-white tracking-tight">
            Posicione Sua Frota
          </h2>
          <p className="text-slate-400">
            Arraste os navios para o tabuleiro ou clique para posicionar.
            Pressione{" "}
            <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-xs font-mono">
              R
            </kbd>{" "}
            para girar.
          </p>
          {match.player2 && (
            <div className="mt-4 p-2 bg-black/30 inline-block rounded-lg border border-white/10">
              <span className="text-yellow-400 font-mono">ADVERSÁRIO:</span>
              <span className="text-white ml-2">{match.player2.username}</span>
              {match.player2.isReady && (
                <span className="text-green-400 ml-2">✓ PRONTO</span>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-col lg:flex-row gap-8 w-full">
          {/* ── Dock (left sidebar) ───────────────────────────────── */}
          <div className="w-full lg:w-80 shrink-0 bg-slate-900/80 border border-slate-800 backdrop-blur-sm rounded-xl p-6 flex flex-col gap-6 h-fit">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-200 uppercase tracking-widest flex items-center gap-2">
                <Anchor className="w-5 h-5" />
                Porto de Guerra
              </h3>
            </div>

            {availableShips.length === 0 && (
              <p className="text-xs text-slate-500 italic">
                Todos os navios foram posicionados.
              </p>
            )}

            <div className="flex flex-col gap-4">
              {availableShips.map((ship) => {
                const config = FLEET_CONFIG[ship.type];
                const isSelected = ship.id === selectedId;

                return (
                  <div
                    key={ship.id}
                    onClick={() =>
                      setSelectedId((prev) =>
                        prev === ship.id ? null : ship.id,
                      )
                    }
                    className={
                      "relative p-4 rounded-lg border-2 transition-all cursor-pointer group select-none " +
                      (isSelected
                        ? "bg-cyan-950/40 border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.2)]"
                        : "bg-slate-950/40 border-slate-800 hover:border-slate-600 hover:bg-slate-900")
                    }
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-sm text-slate-300">
                        {config.label}
                        <span className="ml-1.5 text-slate-500 font-normal">
                          ({config.size} casas)
                        </span>
                      </span>
                      {isSelected && (
                        <span className="text-[10px] font-bold text-cyan-400 animate-pulse">
                          Selecionado...
                        </span>
                      )}
                    </div>

                    <DraggableShip
                      shipId={ship.id}
                      type={ship.type}
                      size={ship.size}
                      orientation={ship.orientation}
                      disabled={
                        !!isPlayerReady || isDeploying || setupMatch.isSuccess
                      }
                    />
                  </div>
                );
              })}
            </div>

            {/* ── Controls ───────────────────────────────────────── */}
            <div className="pt-4 border-t border-slate-800 space-y-3">
              {/* Rotate */}
              <Button
                onClick={() => {
                  if (selectedId) rotateShip(selectedId);
                }}
                variant="outline"
                className="w-full border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800"
                disabled={!selectedId || isDeploying}
              >
                🔄 Girar Navio
              </Button>

              {/* Confirm / Deploy */}
              <Button
                onClick={handleConfirm}
                variant="default"
                className={
                  "w-full h-12 font-bold transition-all " +
                  (canConfirm
                    ? "bg-cyan-600 hover:bg-cyan-500 text-white shadow-[0_0_20px_rgba(8,145,178,0.4)]"
                    : "bg-slate-800 text-slate-500 cursor-not-allowed")
                }
                disabled={!canConfirm}
                isLoading={isDeploying}
              >
                {isDeploying ? "Enviando Frota..." : "✓ Zarpar Frota"}
              </Button>

              {/* Reset */}
              <Button
                onClick={resetFleet}
                variant="ghost"
                className="w-full text-red-400 hover:bg-red-950/20 hover:text-red-300"
                disabled={!!isPlayerReady || isDeploying}
              >
                Reiniciar Tabuleiro
              </Button>

              <Button
                onClick={() => router.push("/lobby")}
                variant="ghost"
                className="w-full text-slate-400 hover:text-white"
              >
                ← Retornar ao Menu Principal
              </Button>
            </div>

            {/* Error toast */}
            {errorMsg && (
              <div className="p-3 bg-red-900/40 border border-red-500/50 rounded-lg animate-in fade-in">
                <p className="text-red-300 text-sm text-center">⚠ {errorMsg}</p>
              </div>
            )}

            {/* Success / waiting state */}
            {(isPlayerReady || setupMatch.isSuccess) && (
              <div className="p-4 bg-emerald-900/30 border border-emerald-600/40 rounded-lg">
                <p className="text-emerald-400 text-center font-bold animate-pulse">
                  ⚓ AGUARDANDO COMANDANTE ADVERSÁRIO...
                </p>
              </div>
            )}
          </div>

          {/* ── Board ──────────────────────────────────────────────── */}
          <div ref={boardRef} className="flex-1 min-w-0">
            <div
              style={{
                width: GRID_NATURAL * gridScale,
                height: GRID_NATURAL * gridScale,
                position: "relative",
              }}
            >
              <div
                style={{
                  transform: `scale(${gridScale})`,
                  transformOrigin: "top left",
                  position: "absolute",
                  top: 0,
                  left: 0,
                }}
              >
                <SetupGrid onCellClick={handleCellClick}>
                  {/* Droppable layer — invisible but receives drops */}
                  {Array.from({ length: GRID_SIZE }, (_, y) =>
                    Array.from({ length: GRID_SIZE }, (_, x) => (
                      <div
                        key={`drop-${x}-${y}`}
                        className="absolute"
                        style={{
                          left: x * CELL_SIZE,
                          top: y * CELL_SIZE,
                          width: CELL_SIZE,
                          height: CELL_SIZE,
                        }}
                      >
                        <DroppableCell x={x} y={y} onClick={handleCellClick} />
                      </div>
                    )),
                  )}

                  {/* Placed ships — draggable on the board */}
                  {placedShips.map((ship) => (
                    <div
                      key={ship.id}
                      className="absolute z-10 pointer-events-auto"
                      style={{
                        left: ship.x * CELL_SIZE,
                        top: ship.y * CELL_SIZE,
                      }}
                    >
                      <DraggableShip
                        shipId={ship.id}
                        type={ship.type}
                        size={ship.size}
                        orientation={ship.orientation}
                        disabled={
                          !!isPlayerReady || isDeploying || setupMatch.isSuccess
                        }
                      />
                    </div>
                  ))}
                </SetupGrid>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Drag Overlay (cursor-attached ghost) ──────────────────────── */}
      <DragOverlay dropAnimation={null}>
        {activeShip ? (
          <ShipUnit
            type={activeShip.type}
            size={activeShip.size}
            orientation={activeShip.orientation}
            ghost
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
