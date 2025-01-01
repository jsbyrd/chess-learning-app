import { Routes, Route } from "react-router";
import Layout from "./Layout";
import Home from "./pages/Home/Home";

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
      </Route>
    </Routes>
  );
}

export default App;
