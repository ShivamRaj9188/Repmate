import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  STORAGE_KEYS,
  getJSON,
  migrateLegacyGoals,
  migrateLegacyPlan,
  migrateLegacyProfile,
  migrateLegacyProgress,
} from "../lib/storage";
import { useAuth } from "../context/AuthContext";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const profile = useMemo(() => {
    if (!user) return {};
    return getJSON(STORAGE_KEYS.profile) || migrateLegacyProfile(user.email) || {};
  }, [user]);

  const goals = useMemo(() => migrateLegacyGoals(), []);
  const plan = useMemo(() => migrateLegacyPlan(), []);
  const progress = useMemo(() => migrateLegacyProgress(), []);

  const completed = Array.isArray(progress.completed) ? progress.completed : [];
  const streakCount = completed.length || 0;
  const totalWorkouts = plan?.totalWorkouts || plan?.workouts?.length || 7;
  const progressPercent = Math.min(
    Math.round((streakCount / Math.max(1, totalWorkouts)) * 100),
    100
  );

  const username =
    (profile.username && String(profile.username).trim()) ||
    (user && user.name) ||
    "Fitness Champ";

  const calories = progress.calories || "No data yet";
  const timeline = progress.timeline || "Track your progress";
  const goalsLabel = goals.length ? goals.join(", ") : "No data yet";

  return (
    <div className="h-full m-0 font-inter bg-[#0f172a] text-white">
      <div className="flex px-10 gap-10 font-orbitron">
        <div className="flex-1 grid grid-cols-2 gap-9 pt-10">
          <h2 className="text-[#3ECF8E] col-span-2 mb-2">
            Welcome back, {username}!
          </h2>

          <div className="dashboard-card bg-[#1a1f27] border-2 border-[#2c3340] rounded-lg p-5 flex flex-col items-center justify-center cursor-pointer transition-transform duration-300 hover:-translate-y-1.5 hover:shadow-[0_12px_24px_rgba(0,255,170,0.2)] hover:bg-[#1f252e] hover:border-[#3ECF8E] w-full h-[150px]">
            <div className="card-content flex items-center justify-center text-[#3ECF8E] text-2xl">
              <span className="ml-2">{streakCount}</span>
            </div>
            <span className="card-label text-[#3ECF8E] text-lg uppercase tracking-wide mt-2">
              Streak
            </span>
          </div>

          <div className="dashboard-card bg-[#1a1f27] border-2 border-[#2c3340] rounded-lg p-5 flex flex-col justify-center cursor-pointer transition-transform duration-300 hover:-translate-y-1.5 hover:shadow-[0_12px_24px_rgba(0,255,170,0.2)] hover:bg-[#1f252e] hover:border-[#3ECF8E] w-full h-[150px]">
            <span className="card-label text-[#3ECF8E] text-lg uppercase tracking-wide mb-2">
              Progress
            </span>
            <div className="w-full bg-[#2c3340] rounded-full h-4">
              <div
                className="bg-[#3ECF8E] h-4 rounded-full text-xs text-black text-center"
                style={{ width: `${progressPercent}%` }}
              >
                {progressPercent}%
              </div>
            </div>
          </div>

          <div
            onClick={() => navigate(plan ? "/workout?day=1" : "/plan")}
            className="dashboard-card bg-[#1a1f27] border-2 border-[#2c3340] rounded-lg p-5 flex flex-col items-center justify-between cursor-pointer transition-transform duration-300 hover:-translate-y-1.5 hover:shadow-[0_12px_24px_rgba(0,255,170,0.2)] hover:bg-[#1f252e] hover:border-[#3ECF8E] min-h-[300px]"
          >
            <div className="card-content flex-1 w-full flex items-center justify-center rounded-lg"></div>
            <span className="card-label text-[#3ECF8E] text-lg uppercase tracking-wide mt-2">
              Workout Logs
            </span>
          </div>

          <div className="dashboard-card bg-[#1a1f27] border-2 border-[#2c3340] rounded-lg p-5 flex flex-col items-center justify-between cursor-pointer transition-transform duration-300 hover:-translate-y-1.5 hover:shadow-[0_12px_24px_rgba(0,255,170,0.2)] hover:bg-[#1f252e] hover:border-[#3ECF8E] min-h-[300px]">
            <div className="card-content flex-1 w-full flex items-center justify-center rounded-lg">
              {calories}
            </div>
            <span className="card-label text-[#3ECF8E] text-lg uppercase tracking-wide mt-2">
              Calories Burned
            </span>
          </div>

          <div className="dashboard-card bg-[#1a1f27] border-2 border-[#2c3340] rounded-lg p-5 flex flex-col items-center justify-between cursor-pointer transition-transform duration-300 hover:-translate-y-1.5 hover:shadow-[0_12px_24px_rgba(0,255,170,0.2)] hover:bg-[#1f252e] hover:border-[#3ECF8E] min-h-[300px]">
            <div className="card-content flex-1 w-full flex items-center justify-center rounded-lg">
              {goalsLabel}
            </div>
            <span className="card-label text-[#3ECF8E] text-lg uppercase tracking-wide mt-2">
              Goals Achieved
            </span>
          </div>

          <div className="dashboard-card bg-[#1a1f27] border-2 border-[#2c3340] rounded-lg p-5 flex flex-col items-center justify-between cursor-pointer transition-transform duration-300 hover:-translate-y-1.5 hover:shadow-[0_12px_24px_rgba(0,255,170,0.2)] hover:bg-[#1f252e] hover:border-[#3ECF8E] min-h-[300px]">
            <div className="card-content flex-1 w-full flex items-center justify-center rounded-lg">
              {timeline}
            </div>
            <span className="card-label text-[#3ECF8E] text-lg uppercase tracking-wide mt-2">
              Progress Timeline
            </span>
          </div>
        </div>

        <aside className="w-[260px] bg-white/5 border-t border-l border-b border-[#42f5b940] p-5 h-screen sticky top-0 flex flex-col justify-between">
          <ul className="flex-1 p-0 m-0">
            <li className="mb-5 text-white font-orbitron text-lg hover:text-[#3ECF8E]">
              <button onClick={() => navigate("/")} className="bg-transparent text-left w-full">
                Home
              </button>
            </li>
            <li className="mb-5 text-white font-orbitron text-lg hover:text-[#3ECF8E]">
              <button onClick={() => navigate("/profile")} className="bg-transparent text-left w-full">
                Profile
              </button>
            </li>
            <li className="mb-5 text-white font-orbitron text-lg hover:text-[#3ECF8E]">
              <button onClick={() => navigate("/goal")} className="bg-transparent text-left w-full">
                Goals
              </button>
            </li>
            <li className="mb-5 text-white font-orbitron text-lg hover:text-[#3ECF8E]">
              <button onClick={() => navigate("/plan")} className="bg-transparent text-left w-full">
                AI Planner
              </button>
            </li>
            <li className="mb-5 text-white font-orbitron text-lg hover:text-[#3ECF8E]">
              <button onClick={() => navigate("/about")} className="bg-transparent text-left w-full">
                About
              </button>
            </li>
            <li className="mb-5 text-white font-orbitron text-lg hover:text-[#3ECF8E]">
              <button onClick={() => navigate("/contact")} className="bg-transparent text-left w-full">
                Contact
              </button>
            </li>
          </ul>
        </aside>
      </div>

      <div className="flex-1 grid grid-cols-2 gap-9 col-span-2 mt-8 mb-8 font-orbitron px-10">
        <div className="dashboard-card bg-[#1a1f27] border-2 border-[#2c3340] rounded-lg p-6 flex flex-col items-center justify-between cursor-pointer transition-transform duration-300 hover:-translate-y-1.5 hover:shadow-[0_12px_24px_rgba(0,255,170,0.2)] hover:bg-[#1f252e] hover:border-[#3ECF8E] min-h-[220px] col-span-2">
          <div className="grid grid-cols-3 gap-6 w-full h-full flex-1">
            <div className="bg-[#12171e] border-2 border-[#2c3340] rounded-lg flex items-center justify-center text-3xl transition hover:border-[#E4405F] hover:shadow-[0_0_12px_#E4405F]">
              🐦
            </div>
            <div className="bg-[#12171e] border-2 border-[#2c3340] rounded-lg flex items-center justify-center text-3xl transition hover:border-[#E4405F] hover:shadow-[0_0_12px_#E4405F]">
              📸
            </div>
            <div className="bg-[#12171e] border-2 border-[#2c3340] rounded-lg flex items-center justify-center text-3xl transition hover:border-[#E4405F] hover:shadow-[0_0_12px_#E4405F]">
              💬
            </div>
          </div>
          <span className="font-orbitron text-[#3ECF8E] text-lg uppercase tracking-wide mt-4">
            Share Progress
          </span>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
