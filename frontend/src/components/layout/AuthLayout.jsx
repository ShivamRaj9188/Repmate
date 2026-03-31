import React from "react";
import { Outlet } from "react-router-dom";

const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-[#10141a] text-[#e4e6eb] font-inter">
      <Outlet />
    </div>
  );
};

export default AuthLayout;
