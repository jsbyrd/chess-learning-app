import { Routes, Route } from "react-router";
import Layout from "./Layout";
import Home from "./pages/Home/Home";
import MakeMove from "./pages/MakeMove/MakeMove";

function Router() {
  return (
    <Routes>
      <Route element={<Layout />}>
        {/* Home */}
        <Route path="/" element={<Home />} />
        {/* Coordinates */}
        <Route path="/coordinates/make-move" element={<MakeMove />} />
      </Route>
    </Routes>
  );
}

export default Router;
