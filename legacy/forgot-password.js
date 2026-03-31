// forgot.js

document.addEventListener("DOMContentLoaded", () => {
  const forgotForm = document.querySelector("#forgot-form");

  forgotForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const email = document.querySelector("#email").value.trim();

    if (!email) {
      alert("Please enter your email.");
      return;
    }

    // Simulate sending email (Replace with real backend logic later)
    setTimeout(() => {
      alert(`Reset link has been sent to ${email}`);
      forgotForm.reset();
    }, 1000);
  });
});
