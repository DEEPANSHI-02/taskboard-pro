import { createContext, useContext, useEffect, useState } from "react";
import { auth } from "./firebase";
import { onAuthStateChanged, getIdToken } from "firebase/auth";
import api from '';
import { useNavigate } from "react-router-dom"; // ✅ added

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate(); // ✅ added

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const idToken = await getIdToken(firebaseUser);
        try {
          console.log("🔥 Sending Firebase ID token to backend:", idToken);

          const res = await api.post(
            "http://localhost:8000/api/auth/google-login",
            {},
            {
              headers: {
                Authorization: `Bearer ${idToken}`,
              },
            }
          );

          setToken(res.data.token);
          setUser(res.data.user);
          api.defaults.headers.common["Authorization"] = `Bearer ${res.data.token}`;

          console.log("✅ Login successful. Redirecting to dashboard...");
          navigate("/dashboard"); // ✅ redirect after login
        } catch (err) {
          console.error("❌ Backend login failed:", err.response?.data || err.message);
          setToken(null);
          setUser(null);
        }
      } else {
        setToken(null);
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  return (
    <AuthContext.Provider value={{ user, token, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
