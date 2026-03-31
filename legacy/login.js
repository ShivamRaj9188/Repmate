// login.js

document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.querySelector("#login-form");

  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const email = document.querySelector("#email").value.trim();
    const password = document.querySelector("#password").value.trim();

    if (!email || !password) {
      alert("Please enter both email and password.");
      return;
    }

    // Simulate login verification (Replace this with actual backend logic later)
    // Let's assume login is successful
    localStorage.setItem("repMateUserLoggedIn", "true");

    // You can also store basic user info like email
    localStorage.setItem("repMateUserEmail", email);

    // ⭐️ Clear active profile & load fresh one
    localStorage.setItem("repMateUserProfile", localStorage.getItem(`repMateUserProfile_${email}`) || "{}");

    // Redirect to profile page
    window.location.href = "profile.html";
  });
});
