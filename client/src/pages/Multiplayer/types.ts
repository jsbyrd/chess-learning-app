export type GameColor = "white" | "black" | "random";

export type GameMetaData = {
  gameId: string;
  numPlayers: number;
  time: string | null;
  p1: string;
  color1: string;
  p2: string;
  color2: string;
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

export type OnUpdateGameMessage = {
  type: "onUpdateGame";
  move: string;
  player: string;
};

export type OnRematchGameMessage = {
  type: "onRematchGame";
  player: string;
};

export type OnPlayerQuitMessage = {
  type: "onPlayerQuit";
  gameId: string;
  msg: string;
};
