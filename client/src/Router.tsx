import { Routes, Route } from "react-router";
import Layout from "./Layout";
import Home from "./pages/Home/Home";
import MakeMove from "./pages/MakeMove/MakeMove";
import NameNotation from "./pages/NameNotation/NameNotation";
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import Analysis from "./pages/Analysis/Analysis";
import SearchSquare from "./pages/SearchSquares/SearchSquare";
import MinigameHistory from "./pages/MinigameHistory/MinigameHistory";
import { socket, WebsocketProvider } from "./components/WebSocketContext";
import GameLayout from "./pages/Multiplayer/GameLayout";
import CreateGame from "./pages/Multiplayer/CreateGame";
import JoinGame from "./pages/Multiplayer/JoinGame";
import WaitGame from "./pages/Multiplayer/WaitGame";
import PlayGame from "./pages/Multiplayer/PlayGame";

function Router() {
  return (
    <Routes>
      <Route element={<Layout />}>
        {/* Home */}
        <Route path="/" element={<Home />} />
        {/* Login/Register */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        {/* Coordinates */}
        <Route path="/coordinates/make-move" element={<MakeMove />} />
        <Route path="/coordinates/name-notation" element={<NameNotation />} />
        <Route path="/coordinates/search-square" element={<SearchSquare />} />
        {/* Games */}
        <Route
          path="/game"
          element={
            <WebsocketProvider value={socket}>
              <GameLayout />
            </WebsocketProvider>
          }
        >
          <Route path="create" element={<CreateGame />}></Route>
          <Route path="join" element={<JoinGame />}></Route>
          <Route path="wait" element={<WaitGame />}></Route>
          <Route path="play" element={<PlayGame />}></Route>
        </Route>
        {/* Analysis */}
        <Route path="/analysis" element={<Analysis />} />
        {/* History */}
        <Route path="/history/minigames" element={<MinigameHistory />} />
      </Route>
    </Routes>
  );
}

export default Router;
