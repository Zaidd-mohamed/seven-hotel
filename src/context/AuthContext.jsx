import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase/firebase";
import {
  fetchUserProfile,
  loginUser,
  logoutUser,
  registerUser,
} from "../firebase/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  async function refreshProfile(uid) {
    const profile = await fetchUserProfile(uid);

    // If profile missing (shouldn't happen), treat as logged out of app logic
    if (!profile) {
      setUserProfile(null);
      return;
    }

    // Disabled users: block access by forcing sign out
    if (profile.disabled) {
      await logoutUser();
      setUserProfile(null);
      setCurrentUser(null);
      return;
    }

    setUserProfile(profile);
  }

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user || null);

      if (!user) {
        setUserProfile(null);
        setLoading(false);
        return;
      }

      try {
        await refreshProfile(user.uid);
      } finally {
        setLoading(false);
      }
    });

    return () => unsub();
  }, []);

  const value = useMemo(
    () => ({
      currentUser,
      userProfile,
      loading,
      register: registerUser,
      login: loginUser,
      logout: logoutUser,
      dashboardPath: () => {
        const role = userProfile?.role;
        if (role === "admin") return "/admin/dashboard";
        if (role === "receptionist" || role === "housekeeping")
          return "/staff/dashboard";
        return "/guest/dashboard";
      },
    }),
    [currentUser, userProfile, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
