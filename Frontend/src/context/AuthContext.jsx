
import { createContext, useEffect, useState } from "react";
import authService from "../services/authService";

export const AuthContext = createContext(null);

function getUserFromToken(token) {
  if (!token) {
    return null;
  }

  try {
    const payload = token.split(".")[1];

    if (!payload) {
      return null;
    }

    const decodedPayload = JSON.parse(
      atob(payload.replace(/-/g, "+").replace(/_/g, "/")),
    );

    return {
      id:
        decodedPayload[
          "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
        ] || decodedPayload.sub,

      email:
        decodedPayload[
          "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"
        ] || decodedPayload.email,

      role:
        decodedPayload[
          "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
        ] || decodedPayload.role,

      name:
        decodedPayload[
          "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"
        ] || decodedPayload.name,
    };
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() =>
    authService.getToken(),
  );

  const [user, setUser] = useState(() =>
    getUserFromToken(authService.getToken()),
  );

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = authService.getToken();

    if (savedToken) {
      setToken(savedToken);
      setUser(getUserFromToken(savedToken));
    } else {
      setToken(null);
      setUser(null);
    }

    setLoading(false);
  }, []);

  const login = async (data) => {
    const response = await authService.login(data);

    const newToken = response?.token;

    if (newToken) {
      setToken(newToken);
      setUser(getUserFromToken(newToken));
    }

    return response;
  };

  const register = async (data) => {
    return authService.register(data);
  };

  const logout = () => {
    authService.logout();
    setToken(null);
    setUser(null);
  };

  const isAuthenticated = Boolean(token);

  const value = {
    token,
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
