
import React from 'react';
import { DebugProvider } from '@/contexts/DebugContext';

const AppProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <DebugProvider>
      {children}
    </DebugProvider>
  );
};

export default AppProviders;
