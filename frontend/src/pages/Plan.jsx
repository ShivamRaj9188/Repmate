import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  STORAGE_KEYS,
  getJSON,
  setJSON,
  migrateLegacyPlan,
  migrateLegacyGoals,
  migrateLegacyProfile,
} from "../lib/storage";
import { useAuth } from "../context/AuthContext";

const Plan = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [showModal, setShowModal] = useState(false);
  const [place, setPlace] = useState("");
  const [planContent, setPlanContent] = useState({
    workout: [],
    diet: [],
    tips: [],
  });

  const profileData = useMemo(() => {
    if (!user) return {};
    return getJSON(STORAGE_KEYS.profile) || migrateLegacyProfile(user.email) || {};
  }, [user]);

  const goalData = useMemo(() => {
    return migrateLegacyGoals() || [];
  }, []);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    const mode = searchParams.get("mode");
    const resolvedPlace = mode === "home" ? "Home" : mode === "gym" ? "Gym" : "";
    if (resolvedPlace) {
      setJSON(STORAGE_KEYS.workoutPlace, resolvedPlace);
      setPlace(resolvedPlace);
      generatePlan(profileData, goalData, resolvedPlace, true);
      return;
    }

    const savedPlan = migrateLegacyPlan();
    if (savedPlan) {
      setPlace(savedPlan.place || "");
      generatePlan(savedPlan.profile || profileData, savedPlan.goal || goalData, savedPlan.place, false);
      return;
    }

    const savedPlace = getJSON(STORAGE_KEYS.workoutPlace);
    if (savedPlace) {
      setPlace(savedPlace);
      generatePlan(profileData, goalData, savedPlace, true);
      return;
    }

    setShowModal(true);
  }, [user, navigate, searchParams, profileData, goalData]);

  const generatePlan = (profile, goals, planPlace, save = true) => {
    const username = profile.username || "RepMate User";
    const fitnessLevel = profile.fitnessLevel || "Intermediate";
    const weight = profile.weight || "70";
    const medical = profile.medical || "";
    const goalsLabel = goals.length ? goals.join(" and ") : "General Fitness";

    const workout = [
      `Hello ${username}! Here is your ${planPlace} workout based on your fitness level ${fitnessLevel} and goal ${goalsLabel}.`,
      `Warm-up: 5-10 mins of dynamic stretches`,
      planPlace === "Gym"
        ? "Main workout: Weighted exercises with progressive overload"
        : "Main workout: Bodyweight routines with high intensity",
      "Cool-down: Gentle stretches and breathing",
    ];

    const diet = [
      `Meals tailored to ${weight}kg and your goal: ${goalsLabel}.`,
      "Breakfast: Oats + 3 eggs + fruit",
      "Lunch: Grilled chicken or fish + rice + veggies",
      "Dinner: Light salad + protein source",
      "Snacks: Nuts, yogurt, protein shake",
    ];

    const tips = [
      "Stay hydrated (3L/day)",
      "Track your progress weekly",
      "Get at least 7-8 hrs of sleep",
    ];
    if (medical) {
      tips.push(`Reminder: Take care of your ${medical}`);
    }

    setPlanContent({ workout, diet, tips });
    setPlace(planPlace);

    if (save) {
      const customPlan = {
        profile,
        goal: goals,
        place: planPlace,
        createdAt: new Date().toISOString(),
      };
      setJSON(STORAGE_KEYS.plan, customPlan);
    }
  };

  const selectWorkoutPlace = (value) => {
    setShowModal(false);
    setJSON(STORAGE_KEYS.workoutPlace, value);
    generatePlan(profileData, goalData, value, true);
  };

  const regeneratePlan = () => {
    generatePlan(profileData, goalData, place || "Home", true);
  };

  const downloadPlan = () => {
    alert("Download feature coming soon!");
  };

  return (
    <div className="bg-[#0d0d0d] text-white flex flex-col min-h-screen font-inter">
      <main className="flex-1 flex flex-col items-center gap-8 p-6 max-w-[1200px] mx-auto">
        <h1 className="font-orbitron text-[#3ECF8E] text-2xl font-bold">
          AI Custom Plan
        </h1>

        <div className="flex flex-wrap justify-center gap-8 w-full">
          <section className="bg-[#1a1f27] border-2 border-[#2c3340] rounded-xl p-6 shadow-md transition hover:-translate-y-1.5 hover:shadow-xl hover:bg-[#1f252e] hover:border-[#3ECF8E] flex-1 min-w-[340px] max-w-[500px] h-[400px] flex flex-col justify-between">
            <h2 className="text-center text-2xl font-orbitron text-[#3ECF8E]">
              Workout Plan
            </h2>
            <div className="bg-[#10141a] border border-[#2c3340] rounded-lg p-4 mt-4 h-full overflow-y-auto transition hover:border-[#0ef] hover:shadow-[0_0_15px_rgba(0,255,170,0.2)]">
              {planContent.workout.length === 0 ? (
                <p className="italic text-white/60">Generating your customized workout plan...</p>
              ) : (
                <ul className="list-disc ml-6 space-y-2">
                  {planContent.workout.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              )}
            </div>
          </section>

          <section className="bg-[#1a1f27] border-2 border-[#2c3340] rounded-xl p-6 shadow-md transition hover:-translate-y-1.5 hover:shadow-xl hover:bg-[#1f252e] hover:border-[#3ECF8E] flex-1 min-w-[340px] max-w-[500px] h-[400px] flex flex-col justify-between">
            <h2 className="text-center text-2xl font-orbitron text-[#3ECF8E]">
              Diet Plan
            </h2>
            <div className="bg-[#10141a] border border-[#2c3340] rounded-lg p-4 mt-4 h-full overflow-y-auto transition hover:border-[#0ef] hover:shadow-[0_0_15px_rgba(0,255,170,0.2)]">
              {planContent.diet.length === 0 ? (
                <p className="italic text-white/60">Crunching macros and meal strategy...</p>
              ) : (
                <ul className="list-disc ml-6 space-y-2">
                  {planContent.diet.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        </div>

        <section className="bg-[#1a1f27] border-2 border-[#2c3340] rounded-xl p-6 shadow-md w-full max-w-[1040px] transition hover:-translate-y-1.5 hover:shadow-xl hover:bg-[#1f252e] hover:border-[#3ECF8E] flex-1 flex flex-col justify-between">
          <h2 className="text-center text-2xl font-orbitron text-[#3ECF8E]">Extra Tips</h2>
          <div className="bg-[#10141a] border border-[#2c3340] rounded-lg p-4 mt-4 h-full overflow-y-auto transition hover:border-[#0ef] hover:shadow-[0_0_15px_rgba(0,255,170,0.2)]">
            {planContent.tips.length === 0 ? (
              <p className="italic text-white/60">Cooking up some personalized advice...</p>
            ) : (
              <ul className="list-disc ml-6 space-y-2">
                {planContent.tips.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            )}
          </div>
        </section>

        <div className="flex justify-center gap-4 mt-8 font-orbitron">
          <button onClick={regeneratePlan} className="bg-[#0066FF] rounded-tl-[15px] rounded-br-[15px] rounded-tr-[8px] rounded-bl-[8px] text-white px-6 py-3 rounded-md transition hover:bg-[#0052cc] hover:-translate-y-0.5 hover:text-[#3ECF8E]">
            Regenerate Plan
          </button>
          <button onClick={downloadPlan} className="bg-[#0066FF] rounded-tl-[15px] rounded-br-[15px] rounded-tr-[8px] rounded-bl-[8px] text-white px-6 py-3 rounded-md transition hover:bg-[#0052cc] hover:-translate-y-0.5 hover:text-[#3ECF8E]">
            Download Plan
          </button>
        </div>

        <div className="flex justify-center mt-4 font-orbitron">
          <button
            onClick={() => navigate("/workout?day=1")}
            className="bg-[#0066FF] rounded-tl-[15px] rounded-br-[15px] rounded-tr-[8px] rounded-bl-[8px] text-white px-6 py-3 rounded-md transition hover:bg-[#0052cc] hover:-translate-y-0.5 hover:text-[#3ECF8E]"
          >
            Start Plan
          </button>
        </div>
      </main>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center">
          <div className="bg-[#1a1f27] border-2 border-[#3ECF8E] rounded-xl p-8 shadow-lg text-center w-[320px]">
            <h2 className="font-orbitron text-[#3ECF8E] text-xl mb-4">Where will you workout?</h2>
            <div className="flex gap-4 justify-center">
              <button onClick={() => selectWorkoutPlace("Home")} className="font-orbitron bg-[#0066FF] text-white px-4 py-2 rounded-md">
                Home
              </button>
              <button onClick={() => selectWorkoutPlace("Gym")} className="font-orbitron bg-[#0066FF] text-white px-4 py-2 rounded-md">
                Gym
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Plan;
