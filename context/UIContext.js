import React, { createContext, useContext, useState } from 'react';

const UIContext = createContext({
  isTabBarVisible: false,
  setTabBarVisible: () => {},
});

export const UIProvider = ({ children }) => {
  const [isTabBarVisible, setTabBarVisible] = useState(true);

  return (
    <UIContext.Provider 
      value={{ 
        isTabBarVisible, 
        setTabBarVisible
      }}
    >
      {children}
    </UIContext.Provider>
  );
};

export const useUI = () => useContext(UIContext);