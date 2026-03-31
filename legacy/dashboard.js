// dashboard.js

document.addEventListener("DOMContentLoaded", () => {
  // === 1. Load Username ===
  const username = localStorage.getItem("username") || "Fitness Champ";
  document.querySelector(".welcome-msg").textContent = `Welcome back, ${username}!`;

  // === 2. Mock Dashboard Data ===
  const mockData = {
    "Workout Logs": "5 workouts this week 💪",
    "Calories Burned": "2,450 kcal 🔥",
    "Goals Achieved": "2 out of 3 🏆",
    "Progress Timeline": "You're improving steadily 📈"
  };

  const cards = document.querySelectorAll(".dashboard-card");

  cards.forEach((card) => {
    const label = card.querySelector(".card-label").textContent.trim();
    const contentBox = card.querySelector(".card-content");

    if (mockData[label]) {
      contentBox.innerHTML = `<p>${mockData[label]}</p>`;
    } else {
      contentBox.innerHTML = `<p>No data yet 💤</p>`;
    }
  });

  // === 3. Logout Logic ===
  const logoutBtn = document.querySelector(".logout-btn");
  logoutBtn.addEventListener("click", () => {
    localStorage.clear();
    window.location.href = "login.html";
  });
});
