// Enums e tipos do jogo 
export enum CellState {
  WATER = 0,
  SHIP = 1,
  HIT = 2,
  MISS = 3,
}
export enum ShipOrientation {
  HORIZONTAL = 'Horizontal',
  VERTICAL = 'Vertical',
}
export enum GameStatus {
  SETUP = 0,
  BATTLE = 1,
  FINISHED = 2,
}
export enum ShipType {
  PORTA_AVIAO = 'Porta-Aviões',         // 5 células
  ENCOURACADO = 'Encouraçado',   // 4 células
  SUBMARINE = 'Submarino',         // 3 células
  DESTROYER = 'Destroyer',     // 3 células
  PATRULHA = 'Patrulha',     // 2 células 
}

export type Coordinate = {
  row: number;
  col: number;
};
