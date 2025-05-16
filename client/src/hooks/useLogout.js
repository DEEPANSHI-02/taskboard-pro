import { createContext, useContext } from 'react';
import { getAuth, signOut } from 'firebase/auth';

// Create the logout utility function
export const logoutUser = async () => {
  try {
    const auth = getAuth();
    await signOut(auth);
    // The AuthProvider will handle redirecting to login
    return true;
  } catch (error) {
    console.error("Logout failed:", error);
    return false;
  }
};

// Create a hook for easier access to the logout function
export const useLogout = () => {
  return { logout: logoutUser };
};