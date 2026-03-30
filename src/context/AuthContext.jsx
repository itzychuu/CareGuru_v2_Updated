import { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribe;

    try {
      unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
        try {
          if (currentUser) {
            // Fetch role from Firestore
            const docRef = doc(db, "users", currentUser.uid);
            const docSnap = await getDoc(docRef);
            
            if (docSnap.exists() && docSnap.data().role) {
              setRole(docSnap.data().role);
            } else {
              console.log("No such user document or no role! Defaulting to patient.");
              setRole("patient"); // Default for legacy users or newly logged in without role
            }
            setUser(currentUser);
          } else {
            setUser(null);
            setRole(null);
          }
        } catch (error) {
          console.error("Firestore error in AuthContext:", error);
          // Still allow the app to load even if data fetch fails, default to patient
          setUser(currentUser); 
          setRole("patient");
        } finally {
          setLoading(false);
        }
      });
    } catch (error) {
      console.error("Firebase auth error:", error);
      setLoading(false);
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, role, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
