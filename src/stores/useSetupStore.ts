/**
 * Setup Store — Ship Placement State Management
 *
 * Zustand store for the positioning (setup) phase.
 *
 * Architecture:
 *  • Pure validation helpers are exported so they can be tested independently.
 *  • The store holds two lists: `availableShips` (dock) and `placedShips` (board).
 *  • Every ship is identified by a unique `id` string.
 *  • No UI / drag-and-drop logic lives here — only data + rules.
 */

import { create } from "zustand";
import { ShipType, ShipOrientation } from "@/types/game-enums";
import { FLEET_CONFIG, GRID_SIZE } from "@/lib/game-rules";

// ─── Exported Types ──────────────────────────────────────────────────────────

/** Ship that lives in the dock (not yet placed on the board). */
export interface DockShip {
  id: string;
  type: ShipType;
  size: number;
  orientation: ShipOrientation;
}

/** Ship placed on the board with absolute coordinates. */
export interface PlacedShip {
  id: string;
  type: ShipType;
  size: number;
  /** Column — 0-based, left → right. */
  x: number;
  /** Row — 0-based, top → bottom. */
  y: number;
  orientation: ShipOrientation;
}

// ─── Pure Validation Logic (no store dependency) ─────────────────────────────

/**
 * Returns the list of cells `{ x, y }` a ship would occupy.
 *
 * Horizontal → extends along the x-axis (columns).
 * Vertical   → extends along the y-axis (rows).
 */
export function getShipCells(
  x: number,
  y: number,
  size: number,
  orientation: ShipOrientation,
): { x: number; y: number }[] {
  const cells: { x: number; y: number }[] = [];
  for (let i = 0; i < size; i++) {
    cells.push({
      x: orientation === ShipOrientation.HORIZONTAL ? x + i : x,
      y: orientation === ShipOrientation.VERTICAL ? y + i : y,
    });
  }
  return cells;
}

/**
 * Checks whether a ship (given start + size + orientation) fits inside the grid.
 */
export function isWithinBounds(
  x: number,
  y: number,
  size: number,
  orientation: ShipOrientation,
  gridSize: number = GRID_SIZE,
): boolean {
  if (x < 0 || y < 0) return false;

  if (orientation === ShipOrientation.HORIZONTAL) {
    return x + size <= gridSize && y < gridSize;
  }
  return y + size <= gridSize && x < gridSize;
}

/**
 * Checks whether any of the `candidateCells` overlaps with already-placed ships.
 *
 * @param excludeShipId  Ship id to skip (useful when repositioning a ship).
 */
export function hasCollision(
  candidateCells: { x: number; y: number }[],
  existingShips: PlacedShip[],
  excludeShipId?: string,
): boolean {
  const occupied = new Set<string>();

  for (const ship of existingShips) {
    if (ship.id === excludeShipId) continue;
    for (const cell of getShipCells(
      ship.x,
      ship.y,
      ship.size,
      ship.orientation,
    )) {
      occupied.add(`${cell.x},${cell.y}`);
    }
  }

  return candidateCells.some((c) => occupied.has(`${c.x},${c.y}`));
}

/**
 * Master validation — **pure function**, testable without a store.
 *
 * @param ship            Object with at least `{ size }`.
 * @param x               Target column.
 * @param y               Target row.
 * @param orientation     Target orientation.
 * @param currentShips    All ships currently on the board.
 * @param excludeShipId   Optional ship id to ignore (for repositioning).
 * @returns `true` when the placement is legal.
 */
export function isValidPlacement(
  ship: { size: number },
  x: number,
  y: number,
  orientation: ShipOrientation,
  currentShips: PlacedShip[],
  excludeShipId?: string,
): boolean {
  if (!isWithinBounds(x, y, ship.size, orientation)) return false;
  const cells = getShipCells(x, y, ship.size, orientation);
  return !hasCollision(cells, currentShips, excludeShipId);
}

// ─── Fleet Factory ───────────────────────────────────────────────────────────

/**
 * Creates the initial dock fleet from `FLEET_CONFIG`.
 * Each ship receives a deterministic `id` derived from its type (and index when
 * `count > 1`).
 */
function createInitialFleet(): DockShip[] {
  const fleet: DockShip[] = [];

  for (const shipType of Object.values(ShipType)) {
    const config = FLEET_CONFIG[shipType];

    for (let i = 0; i < config.count; i++) {
      fleet.push({
        id: config.count === 1 ? shipType : `${shipType}-${i}`,
        type: shipType,
        size: config.size,
        orientation: ShipOrientation.HORIZONTAL,
      });
    }
  }

  return fleet;
}

// ─── Store Interface ─────────────────────────────────────────────────────────

interface SetupState {
  /** Ships remaining in the dock, not yet placed. */
  availableShips: DockShip[];
  /** Ships currently on the board. */
  placedShips: PlacedShip[];
}

interface SetupActions {
  /**
   * Move a ship from the dock to the board or reposition an already-placed ship.
   * @returns `true` when the placement succeeds.
   */
  placeShip: (shipId: string, x: number, y: number) => boolean;

  /**
   * Toggle orientation (H ↔ V).
   * If the ship is on the board, the rotation is only applied when the new
   * orientation still results in a valid position.
   * @returns `true` when the rotation succeeds.
   */
  rotateShip: (shipId: string) => boolean;

  /** Return a placed ship to the dock. */
  removeShip: (shipId: string) => void;

  /** Reset the entire fleet back to the initial dock state. */
  resetFleet: () => void;

  /** `true` when every ship in the fleet has been placed on the board. */
  allShipsPlaced: () => boolean;
}

export type SetupStore = SetupState & SetupActions;

// ─── Zustand Store ───────────────────────────────────────────────────────────

export const useSetupStore = create<SetupStore>((set, get) => ({
  // ── State ──────────────────────────────────────────────────────────────────
  availableShips: createInitialFleet(),
  placedShips: [],

  // ── Actions ────────────────────────────────────────────────────────────────

  placeShip: (shipId, x, y) => {
    const { availableShips, placedShips } = get();

    // 1. Locate the ship — it can be in either list.
    const dockIndex = availableShips.findIndex((s) => s.id === shipId);
    const boardIndex = placedShips.findIndex((s) => s.id === shipId);

    if (dockIndex === -1 && boardIndex === -1) return false;

    const source: DockShip | PlacedShip =
      dockIndex !== -1 ? availableShips[dockIndex] : placedShips[boardIndex];

    // 2. Validate the target position.
    if (
      !isValidPlacement(
        { size: source.size },
        x,
        y,
        source.orientation,
        placedShips,
        boardIndex !== -1 ? shipId : undefined,
      )
    ) {
      return false;
    }

    // 3. Build the placed representation.
    const placed: PlacedShip = {
      id: source.id,
      type: source.type,
      size: source.size,
      x,
      y,
      orientation: source.orientation,
    };

    if (dockIndex !== -1) {
      // Dock → Board
      set({
        availableShips: availableShips.filter((_, i) => i !== dockIndex),
        placedShips: [...placedShips, placed],
      });
    } else {
      // Reposition on board
      set({
        placedShips: placedShips.map((s) => (s.id === shipId ? placed : s)),
      });
    }

    return true;
  },

  rotateShip: (shipId) => {
    const { availableShips, placedShips } = get();

    const flipOrientation = (o: ShipOrientation) =>
      o === ShipOrientation.HORIZONTAL
        ? ShipOrientation.VERTICAL
        : ShipOrientation.HORIZONTAL;

    // Check dock first — rotation in dock always succeeds (no bounds to check).
    const dockIndex = availableShips.findIndex((s) => s.id === shipId);
    if (dockIndex !== -1) {
      set({
        availableShips: availableShips.map((s, i) =>
          i === dockIndex
            ? { ...s, orientation: flipOrientation(s.orientation) }
            : s,
        ),
      });
      return true;
    }

    // Check board — rotation must keep the ship in a valid position.
    const boardIndex = placedShips.findIndex((s) => s.id === shipId);
    if (boardIndex === -1) return false;

    const ship = placedShips[boardIndex];
    const newOrientation = flipOrientation(ship.orientation);

    if (
      !isValidPlacement(
        { size: ship.size },
        ship.x,
        ship.y,
        newOrientation,
        placedShips,
        shipId,
      )
    ) {
      return false;
    }

    set({
      placedShips: placedShips.map((s) =>
        s.id === shipId ? { ...s, orientation: newOrientation } : s,
      ),
    });
    return true;
  },

  removeShip: (shipId) => {
    const { placedShips } = get();
    const ship = placedShips.find((s) => s.id === shipId);
    if (!ship) return;

    const dockShip: DockShip = {
      id: ship.id,
      type: ship.type,
      size: ship.size,
      orientation: ship.orientation,
    };

    set((state) => ({
      placedShips: state.placedShips.filter((s) => s.id !== shipId),
      availableShips: [...state.availableShips, dockShip],
    }));
  },

  resetFleet: () => {
    set({
      availableShips: createInitialFleet(),
      placedShips: [],
    });
  },

  allShipsPlaced: () => {
    return get().availableShips.length === 0;
  },
}));
