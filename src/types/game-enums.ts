// Enums e tipos do jogo 
export enum CellState {
  WATER = 'Water',
  SHIP = 'Ship',
  HIT = 'Hit',
  MISS = 'Missed',
}
export enum ShipOrientation {
  HORIZONTAL = 'Horizontal',
  VERTICAL = 'Vertical',
}
export enum GameStatus {
  SETUP = 'Setup',
  BATTLE = 'InProgress',
  FINISHED = 'Finished',
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
