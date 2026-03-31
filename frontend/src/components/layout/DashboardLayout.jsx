import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../Navbar";
import Footer from "../Footer";

const DashboardLayout = () => {
  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white font-inter">
      <Navbar variant="app" />
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default DashboardLayout;
