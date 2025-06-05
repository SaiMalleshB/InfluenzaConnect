import React, { createContext, useState, useEffect, useContext } from 'react';
import authService from '../services/authService';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

const getCookieFromBrowser = (name) => { /* ... remains the same ... */
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
};
const eraseCookieFromBrowser = (name) => { /* ... remains the same ... */
    document.cookie = name + '=; Max-Age=-99999999; path=/; SameSite=Lax';
};
const setCookieInBrowser = (name, value, days) => { /* ... new helper, same as in authService ... */
  let expires = "";
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    expires = "; expires=" + date.toUTCString();
  }
  document.cookie = name + "=" + (value || "") + expires + "; path=/; SameSite=Lax";
};


export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => { // Made async
      const storedToken = getCookieFromBrowser('userToken');
      const storedUserInfoString = getCookieFromBrowser('userInfo');

      if (storedToken) {
        setToken(storedToken);
        if (storedUserInfoString) {
          try {
            setCurrentUser(JSON.parse(storedUserInfoString));
          } catch (e) {
            console.error("Failed to parse stored user info from cookie", e);
            eraseCookieFromBrowser('userToken');
            eraseCookieFromBrowser('userInfo');
            setToken(null);
            setCurrentUser(null);
          }
        } else {
           // If only token exists but no user info, try to fetch it
           try {
             const userData = await authService.getMe(); // authService.getMe already uses the token from cookie
             setCurrentUser(userData);
             // Re-set userInfo cookie if it was missing or to ensure it's fresh
             setCookieInBrowser('userInfo', JSON.stringify(userData), 30);
           } catch (err) {
             console.error("Failed to fetch user details on init (token present, no userinfo):", err);
             eraseCookieFromBrowser('userToken'); // Token might be invalid
             eraseCookieFromBrowser('userInfo');
             setToken(null);
             setCurrentUser(null);
           }
        }
      }
      setLoading(false);
    };
    initializeAuth();
  }, []);

  const login = async (email, password) => { /* ... remains the same ... */
    try {
      const data = await authService.login({ email, password });
      setToken(data.token);
      setCurrentUser({ _id: data._id, name: data.name, email: data.email, role: data.role });
      return data;
    } catch (error) {
      console.error("Login failed in AuthContext:", error);
      eraseCookieFromBrowser('userToken');
      eraseCookieFromBrowser('userInfo');
      setToken(null);
      setCurrentUser(null);
      throw error;
    }
  };
  const register = async (name, email, password, role) => { /* ... remains the same ... */
    try {
      const data = await authService.register({ name, email, password, role });
      setToken(data.token);
      setCurrentUser({ _id: data._id, name: data.name, email: data.email, role: data.role });
      return data;
    } catch (error) {
      console.error("Registration failed in AuthContext:", error);
      eraseCookieFromBrowser('userToken');
      eraseCookieFromBrowser('userInfo');
      setToken(null);
      setCurrentUser(null);
      throw error;
    }
  };
  const logout = () => { /* ... remains the same ... */
    authService.logout();
    setCurrentUser(null);
    setToken(null);
  };

  // NEW: Function to set auth state after social login callback
  const handleSocialLoginSuccess = (userData) => {
    setCookieInBrowser('userToken', userData.token, 30);
    const userInfo = {
        _id: userData.id, // Or userData._id depending on backend response
        name: userData.name,
        email: userData.email,
        role: userData.role,
    };
    setCookieInBrowser('userInfo', JSON.stringify(userInfo), 30);
    setToken(userData.token);
    setCurrentUser(userInfo);
  };

  const value = {
    currentUser,
    token,
    login,
    register,
    logout,
    handleSocialLoginSuccess, // Added
    isAuthenticated: !!token,
    loadingAuth: loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};