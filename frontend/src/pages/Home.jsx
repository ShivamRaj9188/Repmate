import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Home = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  return (
    <div className="bg-[#10141a] text-[#e4e6eb] font-inter">
      <section className="text-center px-6 py-16">
        <h1 className="text-4xl font-bold text-[#3ECF8E] font-orbitron tracking-wide">
          RepMate: Your Personalized AI Fitness Coach
        </h1>
        <p className="text-base text-[#c8ccd4] max-w-xl mx-auto mt-4">
          Transform your body with a smart, goal-based workout and diet plan
          crafted just for you.
        </p>
        <button
          onClick={() => navigate(isAuthenticated ? "/dashboard" : "/login")}
          className="mt-8 inline-block bg-[#0066FF] text-white px-6 py-3 font-orbitron font-semibold tracking-wide shadow-[0_0_6px_rgba(0,102,255,0.3)] border border-white/5 rounded-tl-[15px] rounded-br-[15px] rounded-tr-[8px] rounded-bl-[8px] hover:bg-[#0052cc] hover:shadow-[0_0_10px_rgba(0,102,255,0.6),0_0_18px_rgba(0,102,255,0.3)] hover:text-[#3ECF8E] hover:-translate-y-0.5 transition"
        >
          Start Your Journey
        </button>
      </section>

      <section className="px-6 py-12 bg-[#12171e] text-center">
        <h2 className="text-2xl font-bold font-orbitron">How It Works</h2>
        <div className="flex flex-wrap justify-center gap-8 mt-8">
          <div className="w-60 h-60 bg-[#1a1f27] border-2 border-[#2c3340] rounded-xl shadow-md p-5 flex flex-col justify-center items-center hover:-translate-y-1.5 hover:shadow-[0_12px_24px_rgba(0,255,170,0.2)] hover:bg-[#1f252e] hover:border-[#3ECF8E] transition">
            <h3 className="text-base font-semibold text-[#3ECF8E] mb-2 font-orbitron">
              Step 1: Choose Your Goal
            </h3>
            <p className="text-sm text-[#c9ccd1] font-normal">
              Tell us the physique you want - lean, bulky, athletic, or just
              healthier.
            </p>
          </div>
          <div className="w-60 h-60 bg-[#1a1f27] border-2 border-[#2c3340] rounded-xl shadow-md p-5 flex flex-col justify-center items-center hover:-translate-y-1.5 hover:shadow-[0_12px_24px_rgba(0,255,170,0.2)] hover:bg-[#1f252e] hover:border-[#3ECF8E] transition">
            <h3 className="text-base font-semibold text-[#3ECF8E] mb-2 font-orbitron">
              Step 2: Get a Custom Plan
            </h3>
            <p className="text-sm text-[#c9ccd1] font-normal">
              Our AI crafts a personalized workout and diet routine just for you.
            </p>
          </div>
          <div className="w-60 h-60 bg-[#1a1f27] border-2 border-[#2c3340] rounded-xl shadow-md p-5 flex flex-col justify-center items-center hover:-translate-y-1.5 hover:shadow-[0_12px_24px_rgba(0,255,170,0.2)] hover:bg-[#1f252e] hover:border-[#3ECF8E] transition">
            <h3 className="text-base font-semibold text-[#3ECF8E] mb-2 font-orbitron">
              Step 3: Start Training
            </h3>
            <p className="text-sm text-[#c9ccd1] font-normal">
              Track progress, stay motivated, and keep leveling up.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
