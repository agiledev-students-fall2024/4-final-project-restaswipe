import React, { createContext, useState, useContext, useEffect } from "react";
import { AccountInfoContext } from "./AccountInfoContext";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [isAuthenticated, setIsAuthenticated] = useState(!!token);
  const { setAccountInfo } = useContext(AccountInfoContext);

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
      setIsAuthenticated(true);
      // Optionally fetch user info here
    } else {
      localStorage.removeItem('token');
      setIsAuthenticated(false);
      setAccountInfo(null);
    }
  }, [token, setAccountInfo]);

  const login = async (jwtToken) => {
    setToken(jwtToken);
  };

  const logout = () => {
    setToken(null);
    setIsAuthenticated(false);
    setAccountInfo(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, token }}>
      {children}
    </AuthContext.Provider>
  );
};
