import { createContext, useContext, useEffect, useState } from "react";
import { loginUser, registerUser } from "@/api";

const AuthContext = createContext(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  /* 🔁 Restore user on page refresh */
  useEffect(() => {
    const userId = localStorage.getItem("userId");
    const userEmail = localStorage.getItem("userEmail");
    const fullName = localStorage.getItem("fullName");
    const role = localStorage.getItem("userRole");

    if (userId && userEmail) {
      setUser({
        id: userId,
        email: userEmail,
        full_name: fullName,
        role,
      });
      setUserRole(role);
    }
  }, []);

  /* 🔐 Login */
  const signIn = async (email, password) => {
    setIsLoading(true);
    try {
      const { data } = await loginUser(email, password);

      setUser(data);
      setUserRole(data.role);

      // persist
      localStorage.setItem("userId", data.id);
      localStorage.setItem("userEmail", data.email);
      localStorage.setItem("fullName", data.full_name);
      localStorage.setItem("userRole", data.role);

      setIsLoading(false);
      return { user: data };
    } catch (err) {
      setIsLoading(false);
      return {
        error: err.response?.data?.detail || "Login failed",
      };
    }
  };

  /* 📝 Register */
  const signUp = async (email, password, fullName) => {
    setIsLoading(true);
    try {
      const { data } = await registerUser(email, password, fullName);

      setUser(data);
      setUserRole(data.role);

      // persist
      localStorage.setItem("userId", data.id);
      localStorage.setItem("userEmail", data.email);
      localStorage.setItem("fullName", data.full_name);
      localStorage.setItem("userRole", data.role);

      setIsLoading(false);
      return { user: data };
    } catch (err) {
      setIsLoading(false);

      let message = "Registration failed";
      const detail = err.response?.data?.detail;

      if (Array.isArray(detail)) {
        message = detail[0]?.msg || message;
      } else if (typeof detail === "string") {
        message = detail;
      }

      return { error: message };
    }
  };

  /* 🚪 Logout */
  const signOut = () => {
    setUser(null);
    setUserRole(null);
    localStorage.clear();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userRole,
        isLoading,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
