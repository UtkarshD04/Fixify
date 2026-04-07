import React, { createContext, useState, useEffect } from "react";
import axios from "axios";

export const UtilityDataContext = createContext();

const UtilityContext = ({ children }) => {
  const [utility, setUtility] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
 
  useEffect(() => {
    const token = sessionStorage.getItem("providerToken");
    const utilityData = sessionStorage.getItem("utilityData");
    
    if (token && utilityData) {
      try {
        setUtility(JSON.parse(utilityData));
      } catch (e) {
        console.error("Error parsing utility data:", e);
        setUtility(null);
      }
    } else {
      setUtility(null);
    }
    
    setIsLoading(false);
  }, []);

  // Listen for localStorage changes
  useEffect(() => {
    const handleStorageChange = () => {
      const utilityData = sessionStorage.getItem("utilityData");
      if (utilityData) {
        try {
          setUtility(JSON.parse(utilityData));
        } catch (e) {
          console.error("Error parsing utility data:", e);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const logout = () => {
    setUtility(null);
    sessionStorage.removeItem('providerToken');
    sessionStorage.removeItem('utilityData');
  };

  return (
    <UtilityDataContext.Provider
      value={{ utility, setUtility, isLoading, error, logout }}
    >
      {children}
    </UtilityDataContext.Provider>
  );
};

export default UtilityContext;
