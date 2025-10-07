import React, { createContext, useContext } from 'react';
import * as Utilities from '../utils/utilities';

const AppContext = createContext();

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }) => {
  const [season, year] = Utilities.thisSeason();
  
  const appConstants = {
    season,
    year,
    smstag: 'sms:?body=',
    keyPrefix: 'favorite_',
  };

  return (
    <AppContext.Provider value={appConstants}>
      {children}
    </AppContext.Provider>
  );
};
