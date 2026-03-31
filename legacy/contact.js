// contact.js

document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("form");
  const nameInput = document.getElementById("name");
  const emailInput = document.getElementById("email");
  const phoneInput = document.getElementById("phone");
  const departmentSelect = document.getElementById("department");
  const messageInput = document.getElementById("message");
  const termsCheckbox = document.getElementById("terms");

  form.addEventListener("submit", (e) => {
    e.preventDefault(); // prevent actual form submission

    let isValid = true;
    let errorMessages = [];

    // === Name ===
    if (nameInput.value.trim() === "") {
      isValid = false;
      errorMessages.push("Please enter your name.");
    }

    // === Email ===
    if (!validateEmail(emailInput.value)) {
      isValid = false;
      errorMessages.push("Please enter a valid email address.");
    }

    // === Phone ===
    if (!validatePhone(phoneInput.value)) {
      isValid = false;
      errorMessages.push("Please enter a valid phone number.");
    }

    // === Department ===
    if (departmentSelect.value === "") {
      isValid = false;
      errorMessages.push("Please select a department.");
    }

    // === Message ===
    if (messageInput.value.trim() === "") {
      isValid = false;
      errorMessages.push("Message field cannot be empty.");
    }

    // === Terms ===
    if (!termsCheckbox.checked) {
      isValid = false;
      errorMessages.push("You must agree to the terms and conditions.");
    }

    if (isValid) {
      alert("✅ Message sent successfully! We'll get back to you soon, legend!");
      form.reset();
    } else {
      alert("⚠️ Oops! Please fix the following:\n\n" + errorMessages.join("\n"));
    }
  });

  // === Email validation ===
  function validateEmail(email) {
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return pattern.test(email);
  }

  // === Phone validation (basic: 10+ digits only) ===
  function validatePhone(phone) {
    const cleaned = phone.replace(/\D/g, "");
    return cleaned.length >= 10;
  }
});
