/**
 * Game Rules — Domain constants for Battleship.
 *
 * Single source of truth for grid dimensions and fleet composition.
 * No UI or state management logic belongs here.
 */
import { ShipType } from "@/types/game-enums";

// ─── Grid ────────────────────────────────────────────────────────────────────

export const GRID_SIZE = 10;

/** Side-length of a single grid cell in pixels. Used by visual components. */
export const CELL_SIZE = 40;

// ─── Fleet Configuration ─────────────────────────────────────────────────────

export interface FleetShipConfig {
  /** Number of cells the ship occupies. */
  size: number;
  /** How many instances of this ship exist in a fleet. */
  count: number;
  /** Human-readable label (PT-BR). */
  label: string;
}

export const FLEET_CONFIG: Record<ShipType, FleetShipConfig> = {
  [ShipType.PORTA_AVIAO_A]: { size: 6, count: 1, label: "Porta-Aviões Alpha" },
  [ShipType.PORTA_AVIAO_B]: { size: 6, count: 1, label: "Porta-Aviões Bravo" },
  [ShipType.NAVIO_GUERRA_A]: {
    size: 4,
    count: 1,
    label: "Navio de Guerra Alpha",
  },
  [ShipType.NAVIO_GUERRA_B]: {
    size: 4,
    count: 1,
    label: "Navio de Guerra Bravo",
  },
  [ShipType.ENCOURACADO]: { size: 3, count: 1, label: "Encouraçado" },
  [ShipType.SUBMARINO]: { size: 1, count: 1, label: "Submarino" },
};

/**
 * Total number of individual ships in a fleet (sum of all counts).
 */
export const TOTAL_SHIP_COUNT = Object.values(FLEET_CONFIG).reduce(
  (sum, cfg) => sum + cfg.count,
  0,
);
