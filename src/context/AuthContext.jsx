import { createContext, useContext, useMemo, useState } from "react";
import { clearSession, createId, getSession, getUsers, saveSession, saveUsers } from "../utils/storage.js";

const AuthContext = createContext(null);

export const ADMIN_CREDENTIALS = {
  email: "admin@stitchaura.com",
  password: "admin123",
};

const ADMIN_USER = {
  id: "admin",
  name: "Boutique Admin",
  email: ADMIN_CREDENTIALS.email,
  role: "admin",
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const session = getSession();
    return session ? { ...session, role: session.role || "user" } : null;
  });

  function signup({ name, email, password }) {
    const users = getUsers();
    const normalizedEmail = email.trim().toLowerCase();
    if (normalizedEmail === ADMIN_CREDENTIALS.email) {
      return { ok: false, message: "This email is reserved for boutique admin login." };
    }

    const alreadyExists = users.some((item) => item.email === normalizedEmail);

    if (alreadyExists) {
      return { ok: false, message: "An account with this email already exists." };
    }

    const newUser = {
      id: createId("user"),
      name: name.trim(),
      email: normalizedEmail,
      password,
      role: "user",
    };

    saveUsers([...users, newUser]);
    const sessionUser = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: "user",
    };
    saveSession(sessionUser);
    setUser(sessionUser);
    return { ok: true, user: sessionUser };
  }

  function login({ email, password }) {
    const normalizedEmail = email.trim().toLowerCase();
    if (normalizedEmail === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
      saveSession(ADMIN_USER);
      setUser(ADMIN_USER);
      return { ok: true, user: ADMIN_USER };
    }

    const match = getUsers().find(
      (item) => item.email === normalizedEmail && item.password === password
    );

    if (!match) {
      return { ok: false, message: "Invalid email or password." };
    }

    const sessionUser = {
      id: match.id,
      name: match.name,
      email: match.email,
      role: match.role || "user",
    };
    saveSession(sessionUser);
    setUser(sessionUser);
    return { ok: true, user: sessionUser };
  }

  function logout() {
    clearSession();
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
