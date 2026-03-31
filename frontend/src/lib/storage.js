const STORAGE_KEYS = {
  user: "repMate.user",
  users: "repMate.users",
  profile: "repMate.profile",
  goals: "repMate.goals",
  plan: "repMate.plan",
  progress: "repMate.progress",
  messages: "repMate.messages",
  workoutPlace: "repMate.workoutPlace",
  questionnaire: "repMate.questionnaire",
};

function safeParse(value, fallback = null) {
  if (!value) return fallback;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function getJSON(key, fallback = null) {
  return safeParse(localStorage.getItem(key), fallback);
}

function setJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function remove(key) {
  localStorage.removeItem(key);
}

function migrateLegacyUsers() {
  const existing = getJSON(STORAGE_KEYS.users, {});
  if (Object.keys(existing).length > 0) return existing;

  const legacyUsers = safeParse(localStorage.getItem("repMateUsers"), {});
  if (legacyUsers && Object.keys(legacyUsers).length > 0) {
    setJSON(STORAGE_KEYS.users, legacyUsers);
    return legacyUsers;
  }

  const legacyUserData = safeParse(localStorage.getItem("repMateUserData"));
  if (legacyUserData && legacyUserData.email) {
    const users = {
      [legacyUserData.email]: {
        email: legacyUserData.email,
        name: legacyUserData.name || "",
        phone: legacyUserData.phone || "",
        password: legacyUserData.password || "",
        profile: {
          username: legacyUserData.name || "",
          email: legacyUserData.email || "",
        },
      },
    };
    setJSON(STORAGE_KEYS.users, users);
    return users;
  }

  return {};
}

function migrateLegacyProfile(email) {
  const profile = getJSON(STORAGE_KEYS.profile);
  if (profile) return profile;

  const legacyProfile =
    safeParse(localStorage.getItem(`repMateUserProfile_${email}`)) ||
    safeParse(localStorage.getItem("repMateUserProfile")) ||
    null;
  if (legacyProfile) {
    setJSON(STORAGE_KEYS.profile, legacyProfile);
    return legacyProfile;
  }
  return null;
}

function migrateLegacyGoals() {
  const goals = getJSON(STORAGE_KEYS.goals);
  if (goals && goals.length) return goals;

  const legacyGoals =
    safeParse(localStorage.getItem("selectedGoals")) ||
    safeParse(localStorage.getItem("selectedGoals_" + (getJSON(STORAGE_KEYS.user)?.email || "")));
  if (legacyGoals && legacyGoals.length) {
    setJSON(STORAGE_KEYS.goals, legacyGoals);
    return legacyGoals;
  }
  return [];
}

function migrateLegacyPlan() {
  const plan = getJSON(STORAGE_KEYS.plan);
  if (plan) return plan;

  const legacyPlan =
    safeParse(localStorage.getItem("repMateSelectedPlan")) ||
    safeParse(localStorage.getItem("selectedPlan"));
  if (legacyPlan) {
    setJSON(STORAGE_KEYS.plan, legacyPlan);
    return legacyPlan;
  }
  return null;
}

function migrateLegacyProgress() {
  const progress = getJSON(STORAGE_KEYS.progress);
  if (progress) return progress;

  const legacyProgress =
    safeParse(localStorage.getItem("repMateProgress")) ||
    safeParse(localStorage.getItem("repMateProgress_completed")) ||
    safeParse(localStorage.getItem("repMateProgressData")) ||
    null;
  if (legacyProgress) {
    const normalized = legacyProgress.completed ? legacyProgress : { completed: legacyProgress };
    setJSON(STORAGE_KEYS.progress, normalized);
    return normalized;
  }
  return { completed: [] };
}

export {
  STORAGE_KEYS,
  getJSON,
  setJSON,
  remove,
  migrateLegacyUsers,
  migrateLegacyProfile,
  migrateLegacyGoals,
  migrateLegacyPlan,
  migrateLegacyProgress,
};
