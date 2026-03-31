import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import img1 from "../assets/images/muscle-gain.png";
import img2 from "../assets/images/fat-loss.png";
import img3 from "../assets/images/endurance.png";
import img4 from "../assets/images/general-fitness.png";
import img5 from "../assets/images/athelete.png";
import img6 from "../assets/images/copy.png";
import { STORAGE_KEYS, getJSON, setJSON } from "../lib/storage";

const GoalSelection = () => {
  const navigate = useNavigate();
  const goalsData = [
    { name: "Muscle Gain", img: img1 },
    { name: "Fat Loss", img: img2 },
    { name: "Endurance", img: img3 },
    { name: "General Fitness", img: img4 },
    { name: "Athletic Build", img: img5 },
    { name: "Injury Rehab", img: img6 },
  ];

  const [selectedGoals, setSelectedGoals] = useState(
    new Set(getJSON(STORAGE_KEYS.goals, []))
  );

  const toggleGoal = (goal) => {
    const updatedGoals = new Set(selectedGoals);
    if (updatedGoals.has(goal)) {
      updatedGoals.delete(goal);
    } else {
      updatedGoals.add(goal);
    }
    setSelectedGoals(updatedGoals);
    setJSON(STORAGE_KEYS.goals, Array.from(updatedGoals));
  };

  const handleContinue = () => {
    if (selectedGoals.size === 0) {
      alert("Please select at least one goal before continuing.");
      return;
    }
    navigate("/questionnaire");
  };

  return (
    <div className="bg-[#10141a] text-[#e4e6eb] font-inter m-0">
      <main className="text-center py-16 px-4">
        <h1 className="text-4xl font-orbitron text-[#3ECF8E] mb-4">
          Choose Your Fitness Goal
        </h1>
        <p className="text-[#e4e6eb]">
          Select one or more goals to get started with a tailored AI plan.
        </p>
      </main>

      <section className="bg-[#12171e] text-center py-12 px-4">
        <div className="flex flex-wrap justify-center gap-8 mt-8">
          {goalsData.map((goal) => {
            const isSelected = selectedGoals.has(goal.name);
            return (
              <div
                key={goal.name}
                className={`goal-card relative w-44 h-44 bg-[#1a1f27] border-2 border-[#2c3340] rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer transition-transform duration-300 hover:-translate-y-1 hover:shadow-[0_12px_24px_rgba(0,255,170,0.2)] hover:bg-[#1f252e] hover:border-[#3ECF8E]
                ${isSelected ? "border-[#00ffcc] shadow-[0_0_16px_#00ffcc,0_0_30px_rgba(0,255,204,0.4)] bg-[#1f252e] -translate-y-1" : ""}`}
                onClick={() => toggleGoal(goal.name)}
              >
                <img
                  src={goal.img}
                  alt={goal.name}
                  className="w-full h-full object-contain rounded-lg transition-transform duration-300"
                />
                <div className="card-desc font-orbitron text-[#3ECF8E] text-lg mt-2">
                  {goal.name}
                </div>
              </div>
            );
          })}
        </div>

        <button
          onClick={handleContinue}
          className="inline-block mt-12 bg-[#0066FF] text-white font-orbitron font-semibold px-6 py-3 rounded-tl-[15px] rounded-br-[15px] rounded-tr-[8px] rounded-bl-[8px] border border-[rgba(255,255,255,0.05)] shadow-[0_0_6px_rgba(0,102,255,0.3)] hover:bg-[#0052cc] hover:text-[#3ECF8E] hover:shadow-[0_0_10px_rgba(0,102,255,0.6),0_0_18px_rgba(0,102,255,0.3)] hover:-translate-y-0.5 transition"
        >
          Continue
        </button>
      </section>
    </div>
  );
};

export default GoalSelection;
