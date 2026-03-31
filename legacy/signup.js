// signup.js

document.addEventListener("DOMContentLoaded", () => {
  const signupForm = document.querySelector("#signup-form");

  signupForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const firstName = document.querySelector("#first-name").value.trim();
    const lastName = document.querySelector("#last-name").value.trim();
    const email = document.querySelector("#email").value.trim();
    const phone = document.querySelector("#phone").value.trim();
    const password = document.querySelector("#password").value.trim();
    const confirmPassword = document.querySelector("#confirm-password").value.trim();

    if (!firstName || !lastName || !email || !phone || !password || !confirmPassword) {
      alert("Please fill out all the fields.");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    // Save user data in localStorage (temporary, until backend)
    const userData = {
      name: `${firstName} ${lastName}`,
      email,
      phone,
      password
    };

    localStorage.setItem("repMateUserData", JSON.stringify(userData));
    localStorage.setItem("repMateUserLoggedIn", "true");

    // Redirect to profile page
    window.location.href = "profile.html";
  });
});
