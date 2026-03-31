import React from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/images/new-logo.png";
import { useAuth } from "../context/AuthContext";

const Navbar = ({ variant = "public" }) => {
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();

  const publicLinks = [
    { to: "/about", label: "About" },
    { to: "/contact", label: "Contact" },
  ];

  const appLinks = [
    { to: "/dashboard", label: "Dashboard" },
    { to: "/goal", label: "Goals" },
    { to: "/plan", label: "AI Planner" },
    { to: "/profile", label: "Profile" },
    { to: "/contact", label: "Contact" },
  ];

  const links = variant === "app" ? appLinks : publicLinks;

  return (
    <header>
      <nav className="flex justify-between items-center px-8 py-5 bg-[#12171e] border-b border-[#2c3340] shadow-md font-orbitron">
        <Link to="/" className="flex items-center gap-2 font-bold text-2xl text-[#3ECF8E]">
          <img
            src={logo}
            alt="RepMate Logo"
            className="w-12 h-12 object-cover rounded-full border-2 border-[#3ECF8E] bg-[#10141a] shadow-[0_0_8px_rgba(0,255,170,0.5),0_0_16px_rgba(0,255,170,0.15)] hover:scale-105 hover:shadow-[0_0_10px_rgba(0,255,170,0.6),0_0_20px_rgba(0,255,170,0.25)] transition duration-300"
          />
          <span className="uppercase tracking-wider">RepMate</span>
        </Link>
        <ul className="flex gap-6 text-[15px] font-semibold items-center">
          {links.map((link) => (
            <li key={link.to}>
              <Link to={link.to} className="nav-link">
                {link.label}
              </Link>
            </li>
          ))}
          {variant === "public" ? (
            isAuthenticated ? (
              <li>
                <button
                  onClick={() => navigate("/dashboard")}
                  className="btn-primary bg-[#0066FF] text-white px-4 py-2 shadow-[0_0_6px_rgba(0,102,255,0.3)] border border-white/5 rounded-tl-[15px] rounded-br-[15px] rounded-tr-[8px] rounded-bl-[8px] hover:bg-[#0052cc] hover:shadow-[0_0_10px_rgba(0,102,255,0.6),0_0_18px_rgba(0,102,255,0.3)] hover:text-[#3ECF8E] hover:-translate-y-0.5"
                >
                  Dashboard
                </button>
              </li>
            ) : (
              <li>
                <Link
                  to="/login"
                  className="btn-primary bg-[#0066FF] text-white px-4 py-2 shadow-[0_0_6px_rgba(0,102,255,0.3)] border border-white/5 hover:bg-[#0052cc] hover:shadow-[0_0_10px_rgba(0,102,255,0.6),0_0_18px_rgba(0,102,255,0.3)] hover:text-[#3ECF8E] hover:-translate-y-0.5"
                >
                  Login
                </Link>
              </li>
            )
          ) : (
            <li>
              <button
                onClick={() => {
                  logout();
                  navigate("/login");
                }}
                className="btn-primary bg-[#ff4f4f] text-black px-4 py-2 border rounded-tl-[15px] rounded-br-[15px] rounded-tr-[8px] rounded-bl-[8px] border-[#ff4f4f] hover:bg-[#ff3b3b]"
              >
                Logout
              </button>
            </li>
          )}
        </ul>
      </nav>
    </header>
  );
};

export default Navbar;
