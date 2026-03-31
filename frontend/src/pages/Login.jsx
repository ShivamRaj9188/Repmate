import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import img from "../assets/images/login.jpg";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const { login, loginAdmin, isAuthenticated } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: "", password: "", remember: false });

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    const { id, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [id]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      alert("Please enter both email and password.");
      return;
    }
    const result = login(form.email.trim(), form.password.trim());
    if (!result.ok) {
      alert(result.error);
      return;
    }
    navigate("/dashboard");
  };

  const handleAdminLogin = () => {
    loginAdmin();
    navigate("/admin-dashboard");
  };

  return (
    <div className="bg-[#10141a] text-[#e4e6eb] m-0 p-0 min-h-screen font-inter">
      <div className="flex h-screen w-full overflow-hidden">
        <div className="flex-1 bg-[#151a20] flex flex-col items-center justify-center p-8 relative shadow-[inset_-5px_0_10px_rgba(0,255,170,0.1)] overflow-hidden">
          <img
            src={img}
            alt="Login"
            className="max-w-[90%] max-h-[70%] object-contain rounded-[12px] border-2 border-dashed border-[#2c3340] 
            shadow-[0_0_10px_rgba(62,207,142,0.1)] transition-transform duration-[400ms] ease-in-out 
            hover:scale-110 hover:border-[#3ECF8E] 
            hover:shadow-[0_0_16px_rgba(62,207,142,0.3),0_0_30px_rgba(62,207,142,0.15)] relative z-10"
          />
          <p className="mt-5 text-[#3ECF8E] text-[0.95rem] font-orbitron text-center drop-shadow-[0_0_6px_rgba(62,207,142,0.3)]">
            "Access your RepMate world."
          </p>
        </div>

        <div className="flex-1 flex items-center justify-center bg-[#1a1f27] shadow-[inset_5px_0_10px_rgba(0,102,255,0.05)] p-8">
          <div className="w-full max-w-[400px] bg-[#12171e] p-8 rounded-[12px] shadow-[0_0_10px_rgba(0,255,170,0.05)]">
            <h1 className="text-center text-[#3ECF8E] font-orbitron text-3xl font-bold mb-8">
              Login
            </h1>

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="flex flex-col">
                <label htmlFor="email" className="font-orbitron text-[#c8ccd4] text-sm mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  placeholder="you@example.com"
                  required
                  value={form.email}
                  onChange={handleChange}
                  className="bg-[#10141a] border border-[#2c3340] rounded-lg px-4 py-3 text-base text-[#e4e6eb] focus:border-[#3ECF8E] focus:shadow-[0_0_10px_rgba(62,207,142,0.2)] outline-none transition"
                />
              </div>

              <div className="flex flex-col relative">
                <label htmlFor="password" className="font-orbitron text-[#c8ccd4] text-sm mb-2">
                  Password
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  placeholder="Your password"
                  required
                  value={form.password}
                  onChange={handleChange}
                  className="bg-[#10141a] border border-[#2c3340] rounded-lg px-4 py-3 pr-10 text-base text-[#e4e6eb] focus:border-[#3ECF8E] focus:shadow-[0_0_10px_rgba(62,207,142,0.2)] outline-none transition"
                />
                <span
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute right-3 top-10 cursor-pointer transition text-lg select-none ${showPassword ? "text-[#3ECF8E]" : "text-gray-400  hover:text-green-500"}`}
                >
                  👁
                </span>
              </div>

              <div className="flex items-center justify-between text-sm mb-6">
                <label className="custom-checkbox flex items-center gap-2 cursor-pointer text-[#c8ccd4]">
                  <input type="checkbox" id="remember" checked={form.remember} onChange={handleChange} />
                  <span className="checkmark"></span>
                  <span className="text-[#c8ccd4] text-[0.95rem]">Remember Me</span>
                </label>
                <Link
                  to="/forgot-password"
                  className="font-orbitron text-[#3ECF8E] hover:drop-shadow-[0_0_6px_rgba(62,207,142,0.3)]"
                >
                  Forgot Password?
                </Link>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#0066FF] text-white font-orbitron font-semibold rounded-tl-[15px] rounded-br-[15px] rounded-tr-[8px] rounded-bl-[8px] text-base cursor-pointer transition hover:bg-[#0052cc] hover:text-[#3ECF8E] hover:[text-shadow:0_0_6px_rgba(62,207,142,0.6)] hover:-translate-y-0.5"
              >
                Login
              </button>

              <button
                type="button"
                onClick={handleAdminLogin}
                className="mt-4 w-full py-3 bg-[#3ECF8E] text-[#10141a] font-orbitron font-semibold rounded-tl-[15px] rounded-br-[15px] rounded-tr-[8px] rounded-bl-[8px] text-base cursor-pointer transition hover:bg-[#2fa96f] hover:text-white hover:-translate-y-0.5"
              >
                Login as Admin
              </button>

              <p className="mt-6 text-center text-[0.95rem] text-[#c8ccd4]">
                New to RepMate?
                <Link
                  to="/signup"
                  className="text-[#3ECF8E] font-semibold hover:drop-shadow-[0_0_6px_rgba(62,207,142,0.4)]"
                >
                  {" "}Create Account
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
