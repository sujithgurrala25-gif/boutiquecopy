import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { fetchCurrentUser, getToken, removeToken, setToken } from "../utils/api.js";
import { auth } from "../utils/firebase.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from "firebase/auth";

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
  const [loading, setLoading] = useState(true);

  // Sync auth state on mount
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Force refresh the token to get the latest ID token
          const token = await firebaseUser.getIdToken(true);
          setToken(token);

          // Get synced database user profile from backend (which auto-creates it if needed)
          const data = await fetchCurrentUser();
          setUser(data.user);
          storeUser(data.user);
        } catch (err) {
          console.error("Error syncing authenticated user with backend:", err);
          // Fallback user state so app works even if backend connection fails temporarily
          const fallbackUser = {
            id: firebaseUser.uid,
            name: firebaseUser.displayName || firebaseUser.email.split("@")[0],
            email: firebaseUser.email,
            role: firebaseUser.email === "admin@stitchaura.com" ? "admin" : "user",
          };
          setUser(fallbackUser);
          storeUser(fallbackUser);
        }
      } else {
        removeToken();
        clearStoredUser();
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  /** Sign up a new user via Firebase Auth */
  async function signup({ name, email, password }) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      // Set name as displayName on firebase
      await updateProfile(userCredential.user, { displayName: name.trim() });
      
      const token = await userCredential.user.getIdToken(true);
      setToken(token);

      // Trigger user profile sync on the backend
      const data = await fetchCurrentUser();
      setUser(data.user);
      storeUser(data.user);

      return { ok: true, user: data.user };
    } catch (err) {
      let friendlyMessage = err.message || "Signup failed.";
      if (err.code === "auth/email-already-in-use") {
        friendlyMessage = "An account with this email already exists.";
      } else if (err.code === "auth/weak-password") {
        friendlyMessage = "Password must be at least 6 characters.";
      } else if (err.code === "auth/invalid-email") {
        friendlyMessage = "Please provide a valid email address.";
      }
      return { ok: false, message: friendlyMessage };
    }
  }

  /** Log in via Firebase Auth */
  async function login({ email, password }) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const token = await userCredential.user.getIdToken(true);
      setToken(token);

      // Trigger user profile sync on the backend
      const data = await fetchCurrentUser();
      setUser(data.user);
      storeUser(data.user);

      return { ok: true, user: data.user };
    } catch (err) {
      let friendlyMessage = err.message || "Login failed.";
      if (
        err.code === "auth/user-not-found" ||
        err.code === "auth/wrong-password" ||
        err.code === "auth/invalid-credential"
      ) {
        friendlyMessage = "Invalid email or password.";
      }
      return { ok: false, message: friendlyMessage };
    }
  }

  /** Log out — clear token + cached user */
  async function logout() {
    try {
      await signOut(auth);
    } catch (err) {
      console.error("Firebase signout error:", err);
    }
    removeToken();
    clearStoredUser();
    setUser(null);
  }

  const value = useMemo(() => ({ user, signup, login, logout }), [user]);

  // Loading spinner to avoid flicker of unprotected routes during initialization
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-plum border-t-transparent"></div>
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}
