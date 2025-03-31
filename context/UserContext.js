import React, { createContext, useContext, useState, useEffect } from 'react';
import { setAuthToken } from '../utils/Backend';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Create the context with default values
const UserContext = createContext({
  userData: null,
  isLoading: true,
  saveUser: () => {},
  resetUser: () => {},
});

// Create a custom hook to use the user context
export const useUser = () => useContext(UserContext);

// Create the provider component
export const UserProvider = ({ children }) => {
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user data from storage on mount
  useEffect(() => {
    const loadUserData = () => {
      AsyncStorage.getItem('userData').then(data => {
        const parsedData = JSON.parse(data);
        if (parsedData) {
          setUserData(parsedData);
          setAuthToken(parsedData.token);
        }
      }).catch(error => {
        setAuthToken(null);
      }).finally(() => {
        setIsLoading(false);
      });
    };

    loadUserData();
  }, []);

  // Save user data to storage and state
  const saveUser = (data) => {
    AsyncStorage.setItem('userData', JSON.stringify(data)).then(() => {
      setUserData(data);
      setAuthToken(data?.token || null);
    }).catch(error => {
      console.error('Failed to store user data', error);
    });
  };

  // Clear user data from storage and state
  const resetUser = () => {
    try {
      AsyncStorage.removeItem('userData');
      setUserData(null);
      setAuthToken(null);
    } catch (error) {
      console.error('Failed to clear user data', error);
    }
  };

  return (
    <UserContext.Provider value={{ userData, isLoading, saveUser, resetUser }}>
      {children}
    </UserContext.Provider>
  );
};