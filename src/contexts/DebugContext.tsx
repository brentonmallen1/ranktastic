
import React, { createContext, useContext, useState, useEffect } from 'react';

interface DebugContextType {
  showApiStatus: boolean;
  toggleApiStatus: () => void;
}

const DebugContext = createContext<DebugContextType>({
  showApiStatus: false,
  toggleApiStatus: () => {},
});

export const useDebug = () => useContext(DebugContext);

export const DebugProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [showApiStatus, setShowApiStatus] = useState<boolean>(false);

  // Check localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('debug_showApiStatus');
    if (saved) {
      setShowApiStatus(saved === 'true');
    }
  }, []);

  const toggleApiStatus = () => {
    const newValue = !showApiStatus;
    setShowApiStatus(newValue);
    localStorage.setItem('debug_showApiStatus', newValue.toString());
  };

  return (
    <DebugContext.Provider value={{ showApiStatus, toggleApiStatus }}>
      {children}
    </DebugContext.Provider>
  );
};
