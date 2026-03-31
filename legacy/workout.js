document.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);
  const day = urlParams.get("day");

  if (!day) {
    alert("Please select a workout plan first.");
    window.location.href = "plan.html";
    return;
  }

function startCamera() {
  alert("Camera activation coming soon! 📷");
}

function goBack() {
  window.location.href = "plan.html";
}


  const workoutTitle = document.getElementById("workout-title");
  const workoutInstructions = document.getElementById("workout-instructions");

  const workouts = {
    1: {
      title: "Day 1: Chest + Core",
      instructions: "🔹 3 Sets x 15 Push-Ups\n🔹 3 Sets x 20 Crunches\n🔹 2 Sets x 30s Plank",
      video: "assets/workout-day1.gif"
    },
    2: {
      title: "Day 2: Legs + Glutes",
      instructions: "🔹 3 Sets x 20 Squats\n🔹 2 Sets x 15 Lunges (each leg)\n🔹 2 Sets x 15 Glute Bridges",
      video: "assets/workout-day2.gif"
    },
    // Add more days as needed
  };

  if (workouts[day]) {
    workoutTitle.textContent = workouts[day].title;
    workoutInstructions.textContent = workouts[day].instructions;
    document.querySelector(".workout-media").src = workouts[day].video;
  } else {
    workoutTitle.textContent = "Invalid Day";
    workoutInstructions.textContent = "Oops! Workout not found.";
  }
});
