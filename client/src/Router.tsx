import { Routes, Route } from "react-router";
import Layout from "./Layout";
import Home from "./pages/Home/Home";
import MakeMove from "./pages/MakeMove/MakeMove";
import NameNotation from "./pages/NameNotation/NameNotation";
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";

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
      </Route>
    </Routes>
  );
}

export default Router;
