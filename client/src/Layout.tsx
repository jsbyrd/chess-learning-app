import { Outlet } from "react-router";
import Header from "./components/Header";

const Layout = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <Outlet />
    </div>
  );
};

export default Layout;
