import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { STORAGE_KEYS, getJSON, setJSON, migrateLegacyPlan, migrateLegacyProgress } from "../lib/storage";

const defaultWorkouts = {
  1: {
    title: "Day 1: Chest + Core",
    instructions: "3 Sets x 15 Push-Ups\n3 Sets x 20 Crunches\n2 Sets x 30s Plank",
    video: "/videos/sample-workout.mp4",
  },
  2: {
    title: "Day 2: Legs + Glutes",
    instructions: "3 Sets x 20 Squats\n2 Sets x 15 Lunges (each leg)\n2 Sets x 15 Glute Bridges",
    video: "/videos/sample-workout.mp4",
  },
  3: {
    title: "Day 3: Back + Biceps",
    instructions: "3 Sets x 12 Pull-Ups\n3 Sets x 15 Dumbbell Rows\n3 Sets x 12 Bicep Curls",
    video: "/videos/sample-workout.mp4",
  },
  4: {
    title: "Day 4: Shoulders + Abs",
    instructions: "3 Sets x 12 Shoulder Press\n3 Sets x 15 Lateral Raises\n3 Sets x 20 Russian Twists",
    video: "/videos/sample-workout.mp4",
  },
  5: {
    title: "Day 5: Full Body HIIT",
    instructions: "30s Jumping Jacks\n30s Burpees\n30s Mountain Climbers\nRepeat x 4 rounds",
    video: "/videos/sample-workout.mp4",
  },
  6: {
    title: "Day 6: Lower Body Strength",
    instructions: "3 Sets x 12 Deadlifts\n3 Sets x 15 Step-Ups\n3 Sets x 20 Calf Raises",
    video: "/videos/sample-workout.mp4",
  },
  7: {
    title: "Day 7: Active Recovery",
    instructions: "20 min Yoga/Stretching\n15 min Light Cardio (Walk or Cycle)\nBreathing Exercises",
    video: "/videos/sample-workout.mp4",
  },
};

const Workout = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [workout, setWorkout] = useState({
    title: "Today's Session",
    instructions: "",
    video: "/videos/sample-workout.mp4",
  });

  useEffect(() => {
    const selectedPlan = getJSON(STORAGE_KEYS.plan) || migrateLegacyPlan();
    if (!selectedPlan) {
      navigate("/plan");
      return;
    }

    let day = Number(searchParams.get("day"));
    if (!day) {
      const today = new Date().getDay();
      day = today === 0 ? 7 : today;
    }

    const workouts = selectedPlan.workouts || defaultWorkouts;
    if (workouts[day]) {
      setWorkout(workouts[day]);
    } else {
      setWorkout({
        title: "Invalid Day",
        instructions: "Workout not found.",
        video: "/videos/sample-workout.mp4",
      });
    }
  }, [navigate, searchParams]);

  const startCamera = () => {
    alert("Camera activation coming soon!");
  };

  const markComplete = () => {
    const progress = migrateLegacyProgress();
    let day = Number(searchParams.get("day")) || new Date().getDay();
    day = day === 0 ? 7 : day;
    if (!progress.completed.includes(day)) {
      progress.completed.push(day);
      setJSON(STORAGE_KEYS.progress, progress);
    }
    alert("Workout marked complete. Streak and progress updated.");
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0d0d0d] text-white font-inter">
      <main className="flex flex-col items-center px-4 py-8 max-w-4xl mx-auto flex-1">
        <section className="bg-[#1a1f27] border-2 border-[#2c3340] rounded-xl p-8 shadow-md w-full max-w-2xl text-center transition hover:-translate-y-1.5 hover:shadow-[0_12px_24px_rgba(0,255,170,0.2)] hover:bg-[#1f252e] hover:border-[#3ECF8E]">
          <h2 className="text-[#3ECF8E] text-2xl font-orbitron">{workout.title}</h2>

          <div className="border border-[#2c3340] rounded-lg bg-[#10141a] mt-4 p-4">
            <video controls className="w-full rounded-lg">
              <source src={workout.video} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>

          <pre className="text-left mt-4 whitespace-pre-line">{workout.instructions}</pre>

          <div className="flex justify-center gap-4 mt-6 flex-wrap font-orbitron">
            <button
              onClick={startCamera}
              className="cta-btn bg-[#0066FF] text-white px-6 py-3 font-semibold tracking-wide border border-white/5 shadow-[0_0_6px_rgba(0,102,255,0.3)] rounded-tl-[15px] rounded-br-[15px] rounded-tr-[8px] rounded-bl-[8px] transition hover:bg-[#0052cc] hover:-translate-y-0.5 hover:text-[#3ECF8E]"
            >
              Start Camera
            </button>
            <button
              onClick={markComplete}
              className="cta-btn bg-[#3ECF8E] text-black px-6 py-3 font-semibold tracking-wide border border-white/5 shadow-[0_0_6px_rgba(62,207,142,0.3)] rounded-tl-[15px] rounded-br-[15px] rounded-tr-[8px] rounded-bl-[8px] transition hover:bg-[#2ea86c] hover:-translate-y-0.5 hover:text-white"
            >
              Mark As Complete
            </button>
            <button
              onClick={() => navigate("/plan")}
              className="cta-btn bg-[#0066FF] text-white px-6 py-3 font-semibold tracking-wide border border-white/5 shadow-[0_0_6px_rgba(0,102,255,0.3)] rounded-tl-[15px] rounded-br-[15px] rounded-tr-[8px] rounded-bl-[8px] transition hover:bg-[#0052cc] hover:-translate-y-0.5 hover:text-[#3ECF8E]"
            >
              Back to Plan
            </button>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Workout;
