import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../Navbar";
import Footer from "../Footer";

const AppLayout = () => {
  return (
    <div className="min-h-screen bg-[#10141a] text-[#e4e6eb] font-inter">
      <Navbar variant="public" />
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default AppLayout;
