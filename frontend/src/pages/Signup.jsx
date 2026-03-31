import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import img from "../assets/images/signup.png";
import { STORAGE_KEYS, getJSON, setJSON, migrateLegacyUsers } from "../lib/storage";
import { useAuth } from "../context/AuthContext";

const Signup = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const { firstName, lastName, email, phone, password, confirmPassword } =
      formData;

    if (!firstName || !lastName || !email || !phone || !password || !confirmPassword) {
      alert("Please fill out all the fields.");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    const users = migrateLegacyUsers();
    if (users[email]) {
      alert("An account with this email already exists.");
      return;
    }

    const userData = {
      name: `${firstName} ${lastName}`,
      email,
      phone,
      password,
      profile: {
        username: `${firstName} ${lastName}`,
        email,
      },
    };

    users[email] = userData;
    setJSON(STORAGE_KEYS.users, users);

    const result = login(email, password);
    if (!result.ok) {
      alert(result.error || "Failed to sign up.");
      return;
    }
    navigate("/profile");
  };

  return (
    <div className="bg-[#10141a] text-[#e4e6eb] w-full h-screen overflow-hidden flex font-inter">
      <div className="flex-1 bg-[#151a20] flex flex-col items-center justify-center p-8 shadow-[0_0_15px_rgba(62,207,142,0.25)]">
        <img
          src={img}
          alt="Signup"
          className="max-w-[90%] max-h-[70%] object-contain rounded-xl border-2 border-dashed border-[#2c3340] transition-transform duration-500 hover:scale-110 hover:border-[#3ECF8E] hover:shadow-[0_0_16px_rgba(62,207,142,0.3),0_0_30px_rgba(62,207,142,0.15)]"
        />
        <p className="caption mt-4 text-[0.95rem] font-orbitron text-[#3ECF8E]">
          "Begin your RepMate journey."
        </p>
      </div>

      <div className="flex-1 flex items-center justify-center bg-[#1a1f27] p-8 shadow-[0_0_15px_rgba(62,207,142,0.25)]">
        <div className="w-full max-w-xl bg-[#12171e] p-8 rounded-xl shadow-[0_0_15px_rgba(62,207,142,0.25)]">
          <h1 className="text-center text-[#3ECF8E] text-3xl font-bold mb-8 font-orbitron">
            Sign Up
          </h1>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="flex gap-4">
              <div className="flex flex-col w-1/2">
                <label htmlFor="firstName" className="text-left text-sm mb-2 text-[#c8ccd4] font-orbitron">
                  First Name
                </label>
                <input
                  type="text"
                  id="firstName"
                  placeholder="First name"
                  required
                  value={formData.firstName}
                  onChange={handleChange}
                  className="bg-[#10141a] border border-[#2c3340] rounded-lg px-4 py-3 text-base focus:outline-none focus:border-[#3ECF8E] focus:shadow-[0_0_10px_rgba(62,207,142,0.3)]"
                />
              </div>
              <div className="flex flex-col w-1/2">
                <label htmlFor="lastName" className="text-left text-sm mb-2 text-[#c8ccd4] font-orbitron">
                  Last Name
                </label>
                <input
                  type="text"
                  id="lastName"
                  placeholder="Last name"
                  required
                  value={formData.lastName}
                  onChange={handleChange}
                  className="bg-[#10141a] border border-[#2c3340] rounded-lg px-4 py-3 text-base focus:outline-none focus:border-[#3ECF8E] focus:shadow-[0_0_10px_rgba(62,207,142,0.3)]"
                />
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex flex-col w-1/2">
                <label htmlFor="email" className="text-left text-sm mb-2 text-[#c8ccd4] font-orbitron">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  placeholder="you@example.com"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="bg-[#10141a] border border-[#2c3340] rounded-lg px-4 py-3 text-base focus:outline-none focus:border-[#3ECF8E] focus:shadow-[0_0_10px_rgba(62,207,142,0.3)]"
                />
              </div>
              <div className="flex flex-col w-1/2">
                <label htmlFor="phone" className="text-left text-sm mb-2 text-[#c8ccd4] font-orbitron">
                  Phone
                </label>
                <input
                  type="tel"
                  id="phone"
                  placeholder="+1 555 123 4567"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  className="bg-[#10141a] border border-[#2c3340] rounded-lg px-4 py-3 text-base focus:outline-none focus:border-[#3ECF8E] focus:shadow-[0_0_10px_rgba(62,207,142,0.3)]"
                />
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex flex-col w-1/2 relative">
                <label htmlFor="password" className="text-left text-sm mb-2 text-[#c8ccd4] font-orbitron">
                  Password
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  placeholder="Password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="bg-[#10141a] border border-[#2c3340] rounded-lg px-4 py-3 text-base focus:outline-none focus:border-[#3ECF8E] focus:shadow-[0_0_10px_rgba(62,207,142,0.3)]"
                />
                <span
                  className={`toggle-eye absolute right-3 bottom-3 cursor-pointer text-xs ${
                    showPassword ? "text-[#3ECF8E]" : "text-gray-400 hover:text-green-500"
                  }`}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  👁
                </span>
              </div>
              <div className="flex flex-col w-1/2 relative">
                <label htmlFor="confirmPassword" className="text-left text-sm mb-2 text-[#c8ccd4] font-orbitron">
                  Confirm Password
                </label>
                <input
                  type={showConfirm ? "text" : "password"}
                  id="confirmPassword"
                  placeholder="Confirm password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="bg-[#10141a] border border-[#2c3340] rounded-lg px-4 py-3 text-base focus:outline-none focus:border-[#3ECF8E] focus:shadow-[0_0_10px_rgba(62,207,142,0.3)]"
                />
                <span
                  className={`toggle-eye absolute right-3 bottom-3 cursor-pointer text-xs ${
                    showConfirm ? "text-[#3ECF8E]" : "text-gray-400 hover:text-green-500"
                  }`}
                  onClick={() => setShowConfirm(!showConfirm)}
                >
                  👁
                </span>
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="w-full text-white font-semibold text-lg px-6 py-3 rounded-tr-[8px] rounded-bl-[8px] rounded-tl-[15px] rounded-br-[15px] font-orbitron bg-[#0066FF] transition-all duration-300 hover:text-[#3ECF8E] hover:-translate-y-0.5"
              >
                Sign Up
              </button>
            </div>

            <p className="text-center text-sm text-[#c8ccd4] font-inter">
              Already have an account?{" "}
              <Link to="/login" className="text-[#3ECF8E] font-semibold">
                Login
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Signup;
