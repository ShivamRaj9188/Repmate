document.addEventListener("DOMContentLoaded", () => {
  let profileData, goalData;

  const userEmail = localStorage.getItem("repMateUserEmail");

  if (userEmail) {
    try {
      profileData = JSON.parse(localStorage.getItem(`repMateUserProfile_${userEmail}`));
    } catch (err) {
      profileData = null;
    }
  }

  try {
    const goalRaw = localStorage.getItem("selectedGoals"); // plural!
    goalData = goalRaw ? JSON.parse(goalRaw) : null;
  } catch (err) {
    goalData = null;
  }

  const workoutBox = document.getElementById("workout-content");
  const dietBox = document.getElementById("diet-content");
  const tipsBox = document.getElementById("tips-content");
  const startWorkoutBtn = document.getElementById("start-workout");

  const isProfileValid = profileData && typeof profileData === "object" && profileData.username;
  const isGoalValid = Array.isArray(goalData) && goalData.length > 0;

  if (!isProfileValid || !isGoalValid) {
    const errorMsg = `<p style='color: red;'>Oops! Missing profile or goal data. Please return to the profile page.</p>`;
    workoutBox.innerHTML = errorMsg;
    dietBox.innerHTML = errorMsg;
    tipsBox.innerHTML = errorMsg;
    return;
  }

  // Show the Start Workout button only if valid data is available
  startWorkoutBtn.style.display = "inline-block";

  const { username, age, gender, height, weight, fitnessLevel, medical } = profileData;
  const goal = goalData.join(" & "); // display nicely

  workoutBox.innerHTML = `
    <p>Hello <strong>${username}</strong>! Here's your workout based on your fitness level <strong>${fitnessLevel}</strong> and goal <strong>${goal}</strong>.</p>
    <ul>
      <li>🧍 Warm-up: 5-10 mins of dynamic stretches</li>
      <li>🏋️ Main workout: Focused routines tailored to ${goal}</li>
      <li>🧘 Cool-down: Gentle stretches and breathing</li>
    </ul>
  `;

  dietBox.innerHTML = `
    <p>Your ideal meals based on weight: <strong>${weight}kg</strong> and goal: <strong>${goal}</strong></p>
    <ul>
      <li>🥗 Breakfast: High protein, moderate carbs</li>
      <li>🍛 Lunch: Balanced macros</li>
      <li>🌯 Dinner: Light and nutrient-rich</li>
    </ul>
  `;

  tipsBox.innerHTML = `
    <ul>
      <li>🚰 Stay hydrated</li>
      <li>📏 Track your progress</li>
      <li>💤 Prioritize recovery and sleep</li>
      ${medical ? `<li>🩺 Personal Tip: Keep an eye on your ${medical}</li>` : ""}
    </ul>
  `;

  // Button click to start workout
  startWorkoutBtn.addEventListener("click", () => {
    const customPlan = {
      goal: goalData,
      profile: profileData,
      createdAt: new Date().toISOString()
    };

    localStorage.setItem("repMateSelectedPlan", JSON.stringify(customPlan));
    window.location.href = "workout.html?day=1";
  });
});
