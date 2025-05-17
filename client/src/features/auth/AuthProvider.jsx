// client/src/features/auth/AuthProvider.jsx
import { createContext, useEffect, useState } from "react";
import { auth } from "./firebase";
import { onAuthStateChanged, getIdToken } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import api from "../../utils/api";

export const AuthContext = createContext(); 

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate(); 

  useEffect(() => {
    console.log("AuthProvider mounted");
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const idToken = await getIdToken(firebaseUser);
          console.log("🔥 Sending Firebase ID token to backend:", idToken);

          // Use a simple fetch instead of the api utility for debugging
          const response = await fetch("/auth/google-login", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${idToken}`
            }
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const data = await response.json();
          console.log("Backend login response:", data);

          setToken(data.token);
          setUser(data.user || { 
            email: firebaseUser.email,
            name: firebaseUser.displayName,
            uid: firebaseUser.uid
          });

          // Store token in localStorage
          localStorage.setItem("authToken", data.token);
          
          // Set default headers for API calls
          if (api && api.defaults) {
            api.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;
          }

          console.log("Login successful. User set:", data.user);
        } catch (err) {
          console.error("Backend login failed:", err);
          // Even if backend authentication fails, we'll use Firebase user data
          // for a better user experience
          setUser({
            email: firebaseUser.email,
            name: firebaseUser.displayName,
            uid: firebaseUser.uid
          });
          setToken(null);
        } finally {
          setLoading(false);
        }
      } else {
        console.log("No Firebase user");
        setToken(null);
        setUser(null);
        localStorage.removeItem("authToken");
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const contextValue = {
    user,
    token,
    loading,
    setUser,
    setToken
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;