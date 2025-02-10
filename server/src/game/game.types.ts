export type GameMetaData = {
  gameId: string;
  numPlayers: number;
  p1: string | null;
  color1: string | null;
  p2: string | null;
  color2: string | null;
};

export type OnUpdateGameMessage = {
  move: string;
  player: string;
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

export type OnDisconnectMessage = {
  gameId: string;
  msg: string;
};
