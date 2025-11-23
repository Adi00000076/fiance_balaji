import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext({
  isAuthenticated: false,
  user: null,
  login: () => {},
  logout: () => {},
});

export function AuthProvider({ children }) {
  const storedUser =
    typeof window !== "undefined" ? localStorage.getItem("user") : null;

  const [user, setUser] = useState(storedUser ? JSON.parse(storedUser) : null);

  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("isAuthenticated", "true");
      } else {
        localStorage.removeItem("user");
        localStorage.setItem("isAuthenticated", "false");
        localStorage.removeItem("token");
      }
    } catch (e) {
      // ignore localStorage errors
    }
  }, [user]);

  const login = (userObj) => setUser(userObj);
  const logout = () => setUser(null);

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
