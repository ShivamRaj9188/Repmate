import React, { createContext, useContext, useMemo, useState } from "react";
import {
  STORAGE_KEYS,
  getJSON,
  setJSON,
  remove,
  migrateLegacyUsers,
  migrateLegacyProfile,
} from "../lib/storage";

const AuthContext = createContext(null);

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => getJSON(STORAGE_KEYS.user));

  const login = (email, password) => {
    const users = migrateLegacyUsers();
    const found = users[email];
    if (!found || found.password !== password) {
      return { ok: false, error: "Invalid email or password." };
    }
    const nextUser = {
      email: found.email || email,
      name: found.name || "",
      role: found.role || "user",
    };
    setJSON(STORAGE_KEYS.user, nextUser);
    setUser(nextUser);
    if (found.profile) {
      setJSON(STORAGE_KEYS.profile, found.profile);
    } else {
      migrateLegacyProfile(email);
    }
    return { ok: true };
  };

  const loginAdmin = () => {
    const adminUser = {
      email: "admin@repmate.local",
      name: "Admin",
      role: "admin",
    };
    setJSON(STORAGE_KEYS.user, adminUser);
    setUser(adminUser);
    return { ok: true };
  };

  const logout = () => {
    remove(STORAGE_KEYS.user);
    setUser(null);
  };

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      login,
      loginAdmin,
      logout,
    }),
    [user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
};

export { AuthProvider, useAuth };
