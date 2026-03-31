// home.js

// Simulating user login check via localStorage
document.addEventListener("DOMContentLoaded", () => {
  const ctaBtn = document.querySelector(".cta-btn");

  ctaBtn.addEventListener("click", (e) => {
    e.preventDefault(); // prevent default <a> behavior

    // Check if user is logged in
    const isLoggedIn = localStorage.getItem("repMateUserLoggedIn");

    if (isLoggedIn === "true") {
      // Redirect to profile or dashboard if logged in
      window.location.href = "profile.html";
    } else {
      // Redirect to login/signup page if not logged in
      window.location.href = "login.html";
    }
  });
});
