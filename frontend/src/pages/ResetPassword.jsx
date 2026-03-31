import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import img from "../assets/images/forgot-password.png";
import { STORAGE_KEYS, getJSON, setJSON, migrateLegacyUsers } from "../lib/storage";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!email || !newPassword || !confirmPassword) {
      alert("Please fill in all fields.");
      return;
    }
    if (newPassword !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    const users = migrateLegacyUsers();
    if (!users[email]) {
      alert("User not found!");
      return;
    }

    users[email].password = newPassword;
    setJSON(STORAGE_KEYS.users, users);

    setTimeout(() => {
      alert("Your password has been reset successfully!");
      setNewPassword("");
      setConfirmPassword("");
      navigate("/login");
    }, 500);
  };

  return (
    <div className="bg-[#10141a] text-[#e4e6eb] m-0 min-h-screen font-inter">
      <div className="flex h-screen w-full overflow-hidden">
        <div className="flex-1 bg-[#151a20] flex flex-col items-center justify-center p-8 relative shadow-inner shadow-[#00ffaa1a] overflow-hidden">
          <img
            src={img}
            alt="Reset Password"
            className="max-w-[90%] max-h-[70%] object-contain rounded-lg border-2 border-dashed border-[#2c3340] shadow-[0_0_10px_rgba(62,207,142,0.1)] transition-transform duration-400 hover:scale-105 hover:border-[#3ECF8E] hover:shadow-[0_0_16px_rgba(62,207,142,0.3),0_0_30px_rgba(62,207,142,0.15)]"
          />
          <p className="mt-4 font-orbitron text-[#3ECF8E] text-sm text-center">
            "Secure your account and get back to RepMate."
          </p>
        </div>

        <div className="flex-1 flex items-center justify-center bg-[#1a1f27] shadow-inner shadow-[#0066ff0d] p-8">
          <div className="w-full max-w-md bg-[#12171e] p-8 rounded-lg shadow-[0_0_10px_rgba(0,255,170,0.05)]">
            <h1 className="text-center text-2xl font-bold font-orbitron text-[#3ECF8E] mb-8">
              Reset Password
            </h1>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex flex-col">
                <label htmlFor="email" className="font-orbitron text-[#c8ccd4] text-sm mb-1">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  placeholder="you@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-[#10141a] border border-[#2c3340] rounded-lg p-3 text-[#e4e6eb] outline-none focus:border-[#3ECF8E] focus:shadow-[0_0_10px_rgba(62,207,142,0.2)]"
                />
              </div>

              <div className="flex flex-col relative">
                <label htmlFor="new-password" className="font-orbitron text-[#c8ccd4] text-sm mb-1">
                  New Password
                </label>
                <input
                  type={showNew ? "text" : "password"}
                  id="new-password"
                  placeholder="Enter new password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="bg-[#10141a] border border-[#2c3340] rounded-lg p-3 pr-10 text-[#e4e6eb] outline-none focus:border-[#3ECF8E] focus:shadow-[0_0_10px_rgba(62,207,142,0.2)]"
                />
                <span
                  className={`absolute right-3 bottom-3 cursor-pointer text-xs ${
                    showNew ? "text-[#3ECF8E]" : "text-gray-400 hover:text-green-500"
                  }`}
                  onClick={() => setShowNew(!showNew)}
                >
                  👁
                </span>
              </div>

              <div className="flex flex-col relative">
                <label htmlFor="confirm-password" className="font-orbitron text-[#c8ccd4] text-sm mb-1">
                  Confirm Password
                </label>
                <input
                  type={showConfirm ? "text" : "password"}
                  id="confirm-password"
                  placeholder="Confirm new password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="bg-[#10141a] border border-[#2c3340] rounded-lg p-3 pr-10 text-[#e4e6eb] outline-none focus:border-[#3ECF8E] focus:shadow-[0_0_10px_rgba(62,207,142,0.2)]"
                />
                <span
                  className={`absolute right-3 bottom-3 cursor-pointer text-xs ${
                    showConfirm ? "text-[#3ECF8E]" : "text-gray-400 hover:text-green-500"
                  }`}
                  onClick={() => setShowConfirm(!showConfirm)}
                >
                  👁
                </span>
              </div>

              <button
                type="submit"
                className="w-full bg-[#0066FF] text-white font-semibold font-orbitron py-3 rounded-tl-[15px] rounded-br-[15px] rounded-tr-[8px] rounded-bl-[8px] transition-all hover:bg-[#0052cc] hover:text-[#3ECF8E] hover:-translate-y-0.5"
              >
                Reset Password
              </button>

              <p className="mt-4 text-center text-sm text-[#c8ccd4]">
                Remembered your password?{" "}
                <Link to="/login" className="text-[#3ECF8E] font-semibold">
                  Login
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
