import React, { createContext, useState, useEffect } from "react";

export const UserDataContext = createContext();

const UserContext = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [address, setAddress] = useState("");
  const [locationType, setLocationType] = useState("live");

  useEffect(() => {
    const token = sessionStorage.getItem("userToken");
    const userData = sessionStorage.getItem("userData");

    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (e) {
        console.error("Error parsing user data:", e);
        setUser(null);
      }
    } else {
      setUser(null);
    }

    setIsLoading(false);
  }, []);

  // Listen for localStorage changes
  useEffect(() => {
    const handleStorageChange = () => {
      const userData = sessionStorage.getItem("userData");
      if (userData) {
        try {
          setUser(JSON.parse(userData));
        } catch (e) {
          console.error("Error parsing user data:", e);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem('userToken');
    sessionStorage.removeItem('userData');
  };

  return (
    <UserDataContext.Provider
      value={{
        user,
        setUser,
        isLoading,
        address,
        setAddress,
        locationType,
        setLocationType,
        logout,
      }}
    >
      {children}
    </UserDataContext.Provider>
  );
};

export default UserContext;
