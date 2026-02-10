// Constantes do jogo
import { ShipType } from '@/types/game-enums';

export const GRID_SIZE = 10;

export const SHIP_SIZES: Record<ShipType, number> = {
  [ShipType.PORTA_AVIAO]: 5,
  [ShipType.ENCOURACADO]: 4,
  [ShipType.DESTROYER]: 3,
  [ShipType.SUBMARINE]: 3,
  [ShipType.PATRULHA]: 2,
};

export const SHIP_NAMES: Record<ShipType, string> = {
  [ShipType.PORTA_AVIAO]: 'Porta-aviões',
  [ShipType.ENCOURACADO]: 'Encouraçado',
  [ShipType.PATRULHA]: 'Patrulha',
  [ShipType.SUBMARINE]: 'Submarino',
  [ShipType.DESTROYER]: 'Destroyer',
};

export const FLEET_COMPOSITION = [
  ShipType.PORTA_AVIAO,
  ShipType.ENCOURACADO,
  ShipType.PATRULHA,
  ShipType.SUBMARINE,
  ShipType.DESTROYER,
];

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5205';
export const API_CONFIG = {
  baseURL: API_BASE_URL,
  withCredentials: true, 
  headers: {
    'Content-Type': 'application/json',
  },
}
export const MATCH_POLLING_INTERVAL = 2000; // 2 segundos
