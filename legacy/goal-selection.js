// goal-selection.js

document.addEventListener("DOMContentLoaded", () => {
  const goalCards = document.querySelectorAll(".goal-card");
  const continueBtn = document.querySelector(".cta-btn");

  // Retrieve from localStorage if available
  const selectedGoals = new Set(JSON.parse(localStorage.getItem("selectedGoals")) || []);

  // Pre-fill selected styles
  goalCards.forEach((card) => {
    const goal = card.dataset.goal;

    if (selectedGoals.has(goal)) {
      card.classList.add("selected-goal");
    }

    // Toggle selection on click
    card.addEventListener("click", () => {
      if (selectedGoals.has(goal)) {
        selectedGoals.delete(goal);
        card.classList.remove("selected-goal");
      } else {
        selectedGoals.add(goal);
        card.classList.add("selected-goal");
      }

      // Save to localStorage
      localStorage.setItem("selectedGoals", JSON.stringify(Array.from(selectedGoals)));
    });
  });

  // Continue button logic
  continueBtn.addEventListener("click", (e) => {
    if (selectedGoals.size === 0) {
      e.preventDefault();
      alert("🏋️‍♀️ Please select at least one goal before continuing!");
    } else {
      // Optionally, redirect handled via href, or you can force redirect:
      // window.location.href = "plan.html";
    }
  });
});
