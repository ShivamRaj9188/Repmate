import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AvatarModal from "../components/AvatarModal";
import { useAuth } from "../context/AuthContext";
import {
  STORAGE_KEYS,
  getJSON,
  setJSON,
  migrateLegacyProfile,
} from "../lib/storage";

const Profile = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [form, setForm] = useState({
    username: "",
    email: "",
    age: "",
    gender: "",
    height: "",
    weight: "",
    diet: "",
    medical: "",
  });
  const [avatar, setAvatar] = useState("/avatars/avatar1.jpeg");
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    const profile =
      getJSON(STORAGE_KEYS.profile) || migrateLegacyProfile(user.email) || {};
    setForm({
      username: profile.username || user.name || "",
      email: profile.email || user.email || "",
      age: profile.age || "",
      gender: profile.gender || "",
      height: profile.height || "",
      weight: profile.weight || "",
      diet: profile.diet || "",
      medical: profile.medical || "",
    });
    if (profile.avatar) setAvatar(profile.avatar);
  }, [user, navigate]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const saveProfile = (e) => {
    e.preventDefault();
    if (
      !form.username ||
      !form.email ||
      !form.age ||
      !form.gender ||
      !form.height ||
      !form.weight
    ) {
      alert("Please fill all required fields.");
      return;
    }
    const updatedProfile = { ...form, avatar };
    setJSON(STORAGE_KEYS.profile, updatedProfile);
    alert("Profile saved.");
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-[#0e0e0e] text-white font-inter">
      <main className="flex flex-col items-center p-8">
        <div className="flex justify-between items-start gap-10 mt-8 w-full max-w-6xl flex-wrap">
          <div className="bg-[#1a1a1a] rounded-lg p-8 w-[420px] shadow-[0_0_15px_#29f5a68c] flex flex-col gap-6">
            <h2 className="font-orbitron text-3xl text-center uppercase text-[#3ECF8E] tracking-wider">
              User Profile
            </h2>

            <form className="flex flex-col gap-4" onSubmit={saveProfile}>
              <div className="flex flex-col">
                <label className="font-orbitron text-sm text-gray-300 mb-1">
                  Username
                </label>
                <input
                  type="text"
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                  placeholder="Enter username"
                  className="w-full max-w-[95%] p-2 rounded bg-[#2c2c2c] text-white outline-none"
                />
              </div>

              <div className="flex flex-col">
                <label className="font-orbitron text-sm text-gray-300 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Enter email"
                  className="w-full max-w-[95%] p-2 rounded bg-[#2c2c2c] text-white outline-none"
                />
              </div>

              <div className="flex gap-4">
                <div className="flex flex-col flex-1">
                  <label className="font-orbitron text-sm text-gray-300 mb-1">
                    Age
                  </label>
                  <input
                    type="number"
                    name="age"
                    value={form.age}
                    onChange={handleChange}
                    placeholder="21"
                    className="w-full p-2 rounded bg-[#2c2c2c] text-white outline-none"
                  />
                </div>

                <div className="flex flex-col flex-1">
                  <label className="font-orbitron text-sm text-gray-300 mb-1">
                    Gender
                  </label>
                  <select
                    name="gender"
                    value={form.gender}
                    onChange={handleChange}
                    className="w-full p-2 rounded bg-[#2c2c2c] text-white outline-none"
                  >
                    <option value="">Select</option>
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex flex-col flex-1">
                  <label className="font-orbitron text-sm text-gray-300 mb-1">
                    Height (cm)
                  </label>
                  <input
                    type="number"
                    name="height"
                    value={form.height}
                    onChange={handleChange}
                    placeholder="170"
                    className="w-full p-2 rounded bg-[#2c2c2c] text-white outline-none"
                  />
                </div>

                <div className="flex flex-col flex-1">
                  <label className="font-orbitron text-sm text-gray-300 mb-1">
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    name="weight"
                    value={form.weight}
                    onChange={handleChange}
                    placeholder="70"
                    className="w-full p-2 rounded bg-[#2c2c2c] text-white outline-none"
                  />
                </div>
              </div>

              <div className="flex flex-col">
                <label className="font-orbitron text-sm text-gray-300 mb-1">
                  Diet Preference
                </label>
                <select
                  name="diet"
                  value={form.diet}
                  onChange={handleChange}
                  className="w-full max-w-[95%] p-2 rounded bg-[#2c2c2c] text-white outline-none"
                >
                  <option value="">Select your preference</option>
                  <option value="vegetarian">Vegetarian</option>
                  <option value="non-vegetarian">Non-Vegetarian</option>
                  <option value="vegan">Vegan</option>
                  <option value="keto">Keto</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="flex flex-col">
                <label className="font-orbitron text-sm text-gray-300 mb-1">
                  Medical Conditions
                </label>
                <textarea
                  rows="4"
                  name="medical"
                  value={form.medical}
                  onChange={handleChange}
                  placeholder="E.g. Asthma, Knee pain, etc."
                  className="w-full max-w-[95%] p-2 rounded bg-[#2c2c2c] text-white outline-none resize-y"
                ></textarea>
              </div>

              <div className="flex justify-center items-center gap-3">
                <label className="font-orbitron">Fitness Goal</label>
                <button
                  type="button"
                  onClick={() => navigate("/goal")}
                  className="btn-primary rounded-tl-[15px] rounded-br-[15px] rounded-tr-[8px] rounded-bl-[8px] bg-[#29f5a6] text-black px-4 py-2"
                >
                  Select Your Goal
                </button>
              </div>

              <div className="flex justify-between mt-4">
                <button type="submit" className="btn-primary rounded-tl-[15px] rounded-br-[15px] rounded-tr-[8px] rounded-bl-[8px] bg-[#29f5a6] text-black px-4 py-2">
                  Save Changes
                </button>
                <button type="button" onClick={handleLogout} className="btn-primary rounded-tl-[15px] rounded-br-[15px] rounded-tr-[8px] rounded-bl-[8px] bg-[#ff4f4f] text-black px-4 py-2">
                  Logout
                </button>
              </div>
            </form>
          </div>

          <div className="flex flex-col items-center gap-3 text-center">
            <div className="group w-[300px] h-[300px] bg-[#1a1f27] border-2 border-dashed border-[#2c3340] rounded-lg overflow-hidden flex justify-center items-center transition hover:scale-[1.03] hover:border-[#3ECF8E]">
              <img
                src={avatar}
                alt="User Avatar"
                className="w-full h-full object-cover rounded-lg transition-transform duration-400 ease-in-out group-hover:scale-105"
              />
            </div>
            <button onClick={() => setModalOpen(true)} className="btn-primar rounded-tl-[15px] rounded-br-[15px] rounded-tr-[8px] rounded-bl-[8px] bg-[#29f5a6] text-black px-4 py-2">
              Change Photo
            </button>
          </div>
        </div>
      </main>

      {modalOpen && (
        <AvatarModal setAvatar={setAvatar} closeModal={() => setModalOpen(false)} />
      )}
    </div>
  );
};

export default Profile;
