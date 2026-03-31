// common js file

window.RM = (function(){
  function _email(){ return localStorage.getItem("repMateUserEmail") || null; }
  return {
    isLoggedIn: ()=> localStorage.getItem("repMateUserLoggedIn")==="true",
    isAdmin: ()=> localStorage.getItem("repMateAdminLoggedIn")==="true",
    setLoggedIn(email){
      localStorage.setItem("repMateUserLoggedIn","true");
      localStorage.setItem("repMateUserEmail", email);
    },
    logout(){
      // only clear session-related keys (avoid deleting user history)
      localStorage.removeItem("repMateUserLoggedIn");
      localStorage.removeItem("repMateUserEmail");
      // don't clear entire localStorage to preserve history; if you want total wipe uncomment:
      // localStorage.clear();
    },
    getProfile(email){
      email = email || _email();
      if(!email) return null;
      const raw = localStorage.getItem(`repMateUserProfile_${email}`);
      return raw ? JSON.parse(raw) : null;
    },
    saveProfile(profile, email){
      email = email || _email();
      if(!email) throw new Error("no-email");
      localStorage.setItem(`repMateUserProfile_${email}`, JSON.stringify(profile));
      // also keep a username quick-access used by dashboard:
      localStorage.setItem("username", profile.username || profile.name || "");
    },
    getSelectedGoals(){ return JSON.parse(localStorage.getItem("selectedGoals")||"[]"); },
    saveSelectedGoals(arr){ localStorage.setItem("selectedGoals", JSON.stringify(arr)); },
    saveQuestionnaire(obj, email){ email = email || _email(); localStorage.setItem(`repMateQuestionnaire_${email}`, JSON.stringify(obj)); },
    getQuestionnaire(email){ email = email || _email(); return JSON.parse(localStorage.getItem(`repMateQuestionnaire_${email}`) || "null"); },
    savePlan(plan){ localStorage.setItem("repMateSelectedPlan", JSON.stringify(plan)); },
    getPlan(){ return JSON.parse(localStorage.getItem("repMateSelectedPlan") || "null"); },

    // update streak & progress after a completed workout
    // plan must be the saved plan (will be updated and saved)
    updateStreakAndProgress({plan}){
      const today = new Date().toISOString().slice(0,10);
      let streak = parseInt(localStorage.getItem("streak") || "0",10);
      const last = localStorage.getItem("lastWorkoutDate") || "";
      // increment streak only once per day
      if(last !== today){
        streak += 1;
        localStorage.setItem("streak", String(streak));
        localStorage.setItem("lastWorkoutDate", today);
      }
      // update plan completedDays & progress
      plan = plan || this.getPlan();
      if(!plan) plan = { completedDays:0, totalDays:7 };
      plan.completedDays = (plan.completedDays || 0) + 1;
      const totalDays = plan.totalDays || 7;
      const progress = Math.min(100, Math.round((plan.completedDays / totalDays) * 100));
      localStorage.setItem("progress", String(progress));
      plan.updatedAt = new Date().toISOString();
      this.savePlan(plan);
      return { streak, progress, completedDays: plan.completedDays };
    },

    // helper guard: call at top of pages that require auth
    requireLogin(redirectTo = "login.html"){
      if(!this.isLoggedIn()) window.location.href = redirectTo;
    },

    // guard for admin
    requireAdmin(redirectTo = "login.html"){
      if(!this.isAdmin()) window.location.href = redirectTo;
    }
  };
})();
