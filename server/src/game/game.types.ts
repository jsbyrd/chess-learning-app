// export type EventType =
//   | 'onStartGame'
//   | 'onUpdateGame'
//   | 'onRematchGame'
//   | 'onPlayerDisconnect';

export type OnUpdateGameMessage = {
  type: 'onUpdateGame';
  move: string;
  player: string;
};

export type OnStartGameMessage = {
  type: 'onStartGame';
  gameId: string;
  numPlayers: number;
  p1: string | null;
  color1: string | null;
  p2: string | null;
  color2: string | null;
};

export type OnPlayerQuitMessage = {
  type: 'onPlayerQuit';
  gameId: string;
  msg: string;
};

export type OnRematchGame = {
  type: 'onRematchGame';
  player: string;
};

export type GameMetaData = {
  gameId: string;
  numPlayers: number;
  p1: string | null;
  color1: string | null;
  p2: string | null;
  color2: string | null;
};

export type OnCreateGameMessage = {
  hasCreatedGame: boolean;
  gameId: string;
  msg: string | null;
};

export type OnJoinGameMessage = {
  hasJoinedGame: boolean;
  gameId: string;
  msg: string | null;
};
