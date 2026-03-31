import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { STORAGE_KEYS, setJSON } from "../lib/storage";

const Questionnaire = () => {
  const navigate = useNavigate();
  const [currentCard, setCurrentCard] = useState(0);
  const [answers, setAnswers] = useState({
    q1: "",
    q2: "",
    q3: "",
    q4: "",
  });
  const [showModal, setShowModal] = useState(false);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setAnswers((prev) => ({ ...prev, [id]: value }));
  };

  const handleNext = () => {
    if (currentCard + 1 < 4) {
      setCurrentCard(currentCard + 1);
    } else {
      setJSON(STORAGE_KEYS.questionnaire, answers);
      setShowModal(true);
    }
  };

  const redirectToPlan = (mode) => {
    setJSON(STORAGE_KEYS.workoutPlace, mode === "home" ? "Home" : "Gym");
    navigate(`/plan?mode=${mode}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0d0d0d] text-white font-inter">
      <main className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-lg relative">
          {[1, 2, 3, 4].map((q, idx) => (
            <div
              key={q}
              className={`question-card bg-[#1a1f27] border border-[#2c3340] rounded-xl p-6 text-center shadow-md transition ${
                currentCard === idx ? "" : "hidden"
              }`}
            >
              {q === 1 && (
                <>
                  <h2 className="text-[#3ECF8E] text-lg font-orbitron mb-4">
                    Preferred workout time?
                  </h2>
                  <select
                    id="q1"
                    value={answers.q1}
                    onChange={handleInputChange}
                    className="w-full p-3 bg-[#10141a] border border-[#2c3340] rounded-lg text-white focus:outline-none focus:border-[#3ECF8E]"
                  >
                    <option value="">-- Select --</option>
                    <option>Morning</option>
                    <option>Afternoon</option>
                    <option>Evening</option>
                    <option>Night</option>
                  </select>
                  <button
                    onClick={handleNext}
                    className="mt-6 bg-[#0066FF] text-white px-6 py-2 rounded-tl-[15px] rounded-br-[15px] rounded-tr-[8px] rounded-bl-[8px] font-orbitron font-semibold hover:bg-[#0052cc] transition"
                    disabled={!answers.q1}
                  >
                    Next
                  </button>
                </>
              )}

              {q === 2 && (
                <>
                  <h2 className="text-[#3ECF8E] text-lg font-orbitron mb-4">
                    Do you have access to equipment?
                  </h2>
                  <select
                    id="q2"
                    value={answers.q2}
                    onChange={handleInputChange}
                    className="w-full p-3 bg-[#10141a] border border-[#2c3340] rounded-lg text-white focus:outline-none focus:border-[#3ECF8E]"
                  >
                    <option value="">-- Select --</option>
                    <option>Full Gym</option>
                    <option>Basic Dumbbells</option>
                    <option>Resistance Bands</option>
                    <option>No Equipment</option>
                  </select>
                  <button
                    onClick={handleNext}
                    className="mt-6 bg-[#0066FF] text-white px-6 py-2 rounded-tl-[15px] rounded-br-[15px] rounded-tr-[8px] rounded-bl-[8px] font-orbitron font-semibold hover:bg-[#0052cc] transition"
                    disabled={!answers.q2}
                  >
                    Next
                  </button>
                </>
              )}

              {q === 3 && (
                <>
                  <h2 className="text-[#3ECF8E] text-lg font-orbitron mb-4">
                    Any injuries we should know?
                  </h2>
                  <input
                    type="text"
                    id="q3"
                    value={answers.q3}
                    onChange={handleInputChange}
                    placeholder="Type here..."
                    className="w-full p-3 bg-[#10141a] border border-[#2c3340] rounded-lg text-white focus:outline-none focus:border-[#3ECF8E]"
                  />
                  <button
                    onClick={handleNext}
                    className="mt-6 bg-[#0066FF] text-white px-6 py-2 rounded-tl-[15px] rounded-br-[15px] rounded-tr-[8px] rounded-bl-[8px] font-orbitron font-semibold hover:bg-[#0052cc] transition"
                    disabled={!answers.q3}
                  >
                    Next
                  </button>
                </>
              )}

              {q === 4 && (
                <>
                  <h2 className="text-[#3ECF8E] text-lg font-orbitron mb-4">
                    How many days per week are you available?
                  </h2>
                  <select
                    id="q4"
                    value={answers.q4}
                    onChange={handleInputChange}
                    className="w-full p-3 bg-[#10141a] border border-[#2c3340] rounded-lg text-white focus:outline-none focus:border-[#3ECF8E]"
                  >
                    <option value="">-- Select --</option>
                    <option>2 Days</option>
                    <option>3 Days</option>
                    <option>4 Days</option>
                    <option>5 Days</option>
                    <option>6 Days</option>
                    <option>7 Days</option>
                  </select>
                  <button
                    onClick={handleNext}
                    className="mt-6 bg-[#3ECF8E] text-black px-6 py-2 rounded-tl-[15px] rounded-br-[15px] rounded-tr-[8px] rounded-bl-[8px] font-orbitron font-semibold hover:bg-[#32b877] transition"
                    disabled={!answers.q4}
                  >
                    Submit
                  </button>
                </>
              )}
            </div>
          ))}
        </div>
      </main>

      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center">
          <div className="bg-[#1a1f27] border border-[#2c3340] rounded-xl p-6 text-center max-w-sm w-full">
            <h2 className="text-[#3ECF8E] font-orbitron mb-4">
              Choose your workout mode
            </h2>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => redirectToPlan("home")}
                className="bg-[#0066FF] hover:bg-[#0052cc] text-white px-5 py-2 rounded-tl-[15px] rounded-br-[15px] rounded-tr-[8px] rounded-bl-[8px] font-orbitron"
              >
                Home
              </button>
              <button
                onClick={() => redirectToPlan("gym")}
                className="bg-[#3ECF8E] hover:bg-[#32b877] text-black px-5 py-2 rounded-tl-[15px] rounded-br-[15px] rounded-tr-[8px] rounded-bl-[8px] font-orbitron"
              >
                Gym
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Questionnaire;
