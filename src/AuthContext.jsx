import { createContext, useContext, useEffect, useState } from "react";
import { auth, googleProvider } from "./firebase";
import { onAuthStateChanged, signInWithPopup, signOut } from "firebase/auth";

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser && firebaseUser.email?.endsWith("@bc.edu")) {
        setUser(firebaseUser);
      } else {
        if (firebaseUser) {
          await signOut(auth);
        }
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const loginWithGoogle = async () => {
    const result = await signInWithPopup(auth, googleProvider);
    const email = result.user?.email ?? "";

    if (!email.endsWith("@bc.edu")) {
      await signOut(auth);
      throw new Error("You must sign in with a @bc.edu email.");
    }
  };

  const logout = () => signOut(auth);

  const value = { user, loading, loginWithGoogle, logout };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
