import { Routes, Route } from "react-router";
import Layout from "./Layout";
import Home from "./pages/Home/Home";
import MakeMove from "./pages/MakeMove/MakeMove";
import NameNotation from "./pages/NameNotation/NameNotation";

function Router() {
  return (
    <Routes>
      <Route element={<Layout />}>
        {/* Home */}
        <Route path="/" element={<Home />} />
        {/* Coordinates */}
        <Route path="/coordinates/make-move" element={<MakeMove />} />
        <Route path="/coordinates/name-notation" element={<NameNotation />} />
      </Route>
    </Routes>
  );
}

export default Router;
