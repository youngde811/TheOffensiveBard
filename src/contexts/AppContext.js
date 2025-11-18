// -*- mode: rjsx; eval: (auto-fill-mode 1); -*-

// This file contains the entry point for our TheOffensiveBard app.

// MIT License

// Copyright (c) 2023 David Young

// Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated
// documentation files (the "Software"), to deal in the Software without restriction, including without limitation the
// rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in all copies or substantial portions of the
// Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE
// WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
// COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

import React, { createContext, useContext, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
  const [favorites, setFavorites] = useState([]);
  const [isLoadingFavorites, setIsLoadingFavorites] = useState(false);

  const keyPrefix = '@insolentbard:';
  const smstag = 'sms://&body=';

  const fetchFavorites = useCallback(async () => {
    setIsLoadingFavorites(true);

    try {
      const keys = await AsyncStorage.getAllKeys();
      const favoriteKeys = keys.filter(key => key.startsWith(keyPrefix) && !key.includes(':settings:'));
      const favoritesList = [];

      for (const key of favoriteKeys) {
        try {
          const insult = await AsyncStorage.getItem(key);

          if (insult) {
            const parsed = JSON.parse(insult);
            
            // Validate that it has the expected structure
            if (parsed && parsed.id !== undefined && parsed.insult) {
              favoritesList.push(parsed);
            } else {
              // Remove corrupted entry
              console.warn('Removing corrupted favorite:', key);

              await AsyncStorage.removeItem(key);
            }
          }
        } catch (parseError) {
          // Skip corrupted entries and remove them
          console.warn('Failed to parse favorite, removing:', key, parseError.message);

          await AsyncStorage.removeItem(key);
        }
      }

      setFavorites(favoritesList);
    } catch (error) {
      console.error('Error fetching favorites:', error);
      
      setFavorites([]);
    } finally {
      setIsLoadingFavorites(false);
    }
  }, []);

  const addFavorite = useCallback(async (item) => {
    const key = keyPrefix + item.id;

    try {
      await AsyncStorage.setItem(key, JSON.stringify(item));
      await fetchFavorites();

      return true;
    } catch (error) {
      console.error('Error adding favorite:', error);

      return false;
    }
  }, [fetchFavorites]);

  const removeFavorite = useCallback(async (item) => {
    const key = keyPrefix + item.id;

    try {
      await AsyncStorage.removeItem(key);
      await fetchFavorites();

      return true;
    } catch (error) {
      console.error('Error removing favorite:', error);

      return false;
    }
  }, [fetchFavorites]);

  const appConstants = {
    season,
    year,
    smstag,
    keyPrefix,
    favorites,
    isLoadingFavorites,
    fetchFavorites,
    addFavorite,
    removeFavorite,
  };

  return (
    <AppContext.Provider value={appConstants}>
      {children}
    </AppContext.Provider>
  );
};
