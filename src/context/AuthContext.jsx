import { createContext, useContext, useMemo, useState } from "react";
import { authLogin, authLogout, authSignup, getToken, removeToken, setToken } from "../utils/api.js";

const AuthContext = createContext(null);

/** Read the minimal user object cached after login/signup */
function readStoredUser() {
  try {
    const raw = localStorage.getItem("stitchaura_user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function storeUser(user) {
  localStorage.setItem("stitchaura_user", JSON.stringify(user));
}

function clearStoredUser() {
  localStorage.removeItem("stitchaura_user");
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    // Restore session only if token still exists
    if (getToken()) return readStoredUser();
    return null;
  });

  /** Sign up a new user via the API */
  async function signup({ name, email, password }) {
    try {
      const data = await authSignup({ name, email, password });
      setToken(data.token);
      storeUser(data.user);
      setUser(data.user);
      return { ok: true, user: data.user };
    } catch (err) {
      return { ok: false, message: err.message || "Signup failed." };
    }
  }

  /** Log in via the API */
  async function login({ email, password }) {
    try {
      const data = await authLogin({ email, password });
      setToken(data.token);
      storeUser(data.user);
      setUser(data.user);
      return { ok: true, user: data.user };
    } catch (err) {
      return { ok: false, message: err.message || "Login failed." };
    }
  }

  /** Log out — clear token + cached user */
  async function logout() {
    try { await authLogout(); } catch { /* ignore */ }
    removeToken();
    clearStoredUser();
    setUser(null);
  }

  const value = useMemo(() => ({ user, signup, login, logout }), [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}
