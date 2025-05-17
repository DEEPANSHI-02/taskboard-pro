// client/src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import { auth } from "../features/auth/firebase";
import { onAuthStateChanged, getIdToken } from "firebase/auth";
import api from "../utils/api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Get the Firebase ID token
          const idToken = await getIdToken(firebaseUser);
          
          // Send the token to your backend
          const response = await api.post(
            "/api/auth/google-login",
            {},
            {
              headers: {
                Authorization: `Bearer ${idToken}`,
              },
            }
          );

          // Store user data and session token
          setUser(response.data.user);
          setToken(response.data.token);
          
          // Set the token in local storage for persistence
          localStorage.setItem("token", response.data.token);
          
          // Set default auth header for subsequent requests
          api.defaults.headers.common["Authorization"] = `Bearer ${response.data.token}`;
        } catch (err) {
          console.error("Backend authentication failed:", err);
          setUser(null);
          setToken(null);
          localStorage.removeItem("token");
        }
      } else {
        // User is signed out
        setUser(null);
        setToken(null);
        localStorage.removeItem("token");
        api.defaults.headers.common["Authorization"] = "";
      }
      setLoading(false);
    });

    // Check for existing token in localStorage on initialization
    const existingToken = localStorage.getItem("token");
    if (existingToken) {
      setToken(existingToken);
      api.defaults.headers.common["Authorization"] = `Bearer ${existingToken}`;
      
      // Optionally verify the token with your backend
      api.get("/api/auth/verify")
        .then(response => {
          setUser(response.data.user);
        })
        .catch(err => {
          // Token invalid or expired
          localStorage.removeItem("token");
          setToken(null);
        });
    }

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading, setUser, setToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);