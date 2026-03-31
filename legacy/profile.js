// profile.js

document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector(".profile-form");
  const changeAvatarBtn = document.getElementById("change-avatar-btn");
  const avatarModal = document.getElementById("avatar-modal");
  const closeAvatarPopup = document.getElementById("close-avatar-popup");
  const avatarOptions = document.querySelectorAll(".avatar-option");
  const profileImage = document.querySelector(".profile-image-box img");

  // LOGIN VALIDATION: Block access if not logged in
  if (!localStorage.getItem("repMateUserLoggedIn")) {
    window.location.href = "login.html";
    return;
  }

  // Get current user email
  const currentUserEmail = localStorage.getItem("repMateUserEmail");

  // Load user data safely
  try {
    const savedProfile =
      JSON.parse(localStorage.getItem("repMateUserProfile_" + currentUserEmail)) ||
      JSON.parse(localStorage.getItem("repMateUserProfile"));

    if (savedProfile) {
      form.username.value = savedProfile.username || "";
      form.email.value = savedProfile.email || "";
      form.age.value = savedProfile.age || "";
      form.gender.value = savedProfile.gender || "";
      form.height.value = savedProfile.height || "";
      form.weight.value = savedProfile.weight || "";
      form.diet.value = savedProfile.diet || "";
      form.medical.value = savedProfile.medical || "";

      if (savedProfile.avatar) {
        profileImage.src = savedProfile.avatar;
      }
    }
  } catch (err) {
    console.error("Error loading saved profile:", err);
    alert("We couldn't load your profile. Please try again.");
  }

  // Save profile with field validation
  document.querySelector(".btn-primary").addEventListener("click", (e) => {
    e.preventDefault();

    const updatedProfile = {
      username: form.username.value.trim(),
      email: form.email.value.trim(),
      age: form.age.value.trim(),
      gender: form.gender.value,
      height: form.height.value.trim(),
      weight: form.weight.value.trim(),
      diet: form.diet.value,
      medical: form.medical.value.trim(),
      avatar: profileImage.src,
    };

    // Field Validation
    if (
      !updatedProfile.username ||
      !updatedProfile.email ||
      !updatedProfile.age ||
      !updatedProfile.gender ||
      !updatedProfile.height ||
      !updatedProfile.weight
    ) {
      alert("Please fill in all required fields.");
      return;
    }

    // Numeric check
    if (
      isNaN(updatedProfile.age) ||
      isNaN(updatedProfile.height) ||
      isNaN(updatedProfile.weight)
    ) {
      alert("Age, height, and weight must be valid numbers.");
      return;
    }

    // Email check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(updatedProfile.email)) {
      alert("Please enter a valid email address.");
      return;
    }

    // Save to localStorage
    try {
      localStorage.setItem("repMateUserProfile", JSON.stringify(updatedProfile));
      if (currentUserEmail) {
        localStorage.setItem("repMateUserProfile_" + currentUserEmail, JSON.stringify(updatedProfile));
      }

      alert("Profile saved! Now let's select your goals. 🚀");
      window.location.href = "goal-selection.html";
    } catch (error) {
      console.error("Failed to save profile:", error);
      alert("Something went wrong while saving. Please try again.");
    }
  });

  // Logout button logic
  document.querySelector(".btn-logout").addEventListener("click", (e) => {
    e.preventDefault();
    localStorage.removeItem("repMateUserLoggedIn");
    localStorage.removeItem("repMateUserEmail");
    localStorage.removeItem("repMateUserProfile");
    window.location.href = "login.html";
  });

  // Open avatar modal
  changeAvatarBtn.addEventListener("click", () => {
    avatarModal.style.display = "flex";
  });

  // Close avatar modal
  closeAvatarPopup.addEventListener("click", () => {
    avatarModal.style.display = "none";
  });

  // Avatar selection logic
  avatarOptions.forEach((avatar) => {
    avatar.addEventListener("click", () => {
      avatarOptions.forEach((a) => a.classList.remove("selected"));
      avatar.classList.add("selected");
      profileImage.src = avatar.src;

      const profile =
        JSON.parse(localStorage.getItem("repMateUserProfile_" + currentUserEmail)) ||
        JSON.parse(localStorage.getItem("repMateUserProfile")) ||
        {};

      profile.avatar = avatar.src;

      localStorage.setItem("repMateUserProfile", JSON.stringify(profile));
      if (currentUserEmail) {
        localStorage.setItem("repMateUserProfile_" + currentUserEmail, JSON.stringify(profile));
      }

      avatarModal.style.display = "none";
    });
  });
});
