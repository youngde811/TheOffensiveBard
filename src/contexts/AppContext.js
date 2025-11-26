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
  const [creations, setCreations] = useState([]);
  const [isLoadingCreations, setIsLoadingCreations] = useState(false);

  const keyPrefix = '@insolentbard:';
  const creationKeyPrefix = '@insolentbard:creation:';
  const smstag = 'sms://&body=';

  const fetchFavorites = useCallback(async () => {
    setIsLoadingFavorites(true);

    try {
      const keys = await AsyncStorage.getAllKeys();
      const favoriteKeys = keys.filter(key => key.startsWith(keyPrefix) && !key.includes(':settings:') && !key.includes(':creation:'));
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

  // Creations functions
  const fetchCreations = useCallback(async () => {
    setIsLoadingCreations(true);

    try {
      const keys = await AsyncStorage.getAllKeys();
      const creationKeys = keys.filter(key => key.startsWith(creationKeyPrefix));
      const creationsList = [];

      for (const key of creationKeys) {
        try {
          const creation = await AsyncStorage.getItem(key);

          if (creation) {
            const parsed = JSON.parse(creation);

            if (parsed && parsed.id !== undefined && parsed.insult) {
              creationsList.push(parsed);
            } else {
              console.warn('Removing corrupted creation:', key);
              await AsyncStorage.removeItem(key);
            }
          }
        } catch (parseError) {
          console.warn('Failed to parse creation, removing:', key, parseError.message);
          await AsyncStorage.removeItem(key);
        }
      }

      // Sort by createdAt descending (newest first)
      creationsList.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      setCreations(creationsList);
    } catch (error) {
      console.error('Error fetching creations:', error);
      setCreations([]);
    } finally {
      setIsLoadingCreations(false);
    }
  }, []);

  const addCreation = useCallback(async (insultText) => {
    // Check for duplicate
    const existingCreation = creations.find(c => c.insult === insultText);
    if (existingCreation) {
      return { success: false, reason: 'duplicate' };
    }

    // Guard against AsyncStorage not being ready
    if (!AsyncStorage) {
      console.error('AsyncStorage not available');
      return { success: false, reason: 'error' };
    }

    const id = Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    const newCreation = {
      id,
      insult: insultText,
      createdAt: Date.now(),
    };

    const key = creationKeyPrefix + id;

    try {
      await AsyncStorage.setItem(key, JSON.stringify(newCreation));
      await fetchCreations();

      return { success: true };
    } catch (error) {
      console.error('Error adding creation:', error);

      return { success: false, reason: 'error' };
    }
  }, [creations, fetchCreations]);

  const removeCreation = useCallback(async (item) => {
    const key = creationKeyPrefix + item.id;

    try {
      await AsyncStorage.removeItem(key);
      await fetchCreations();

      return true;
    } catch (error) {
      console.error('Error removing creation:', error);

      return false;
    }
  }, [fetchCreations]);

  const clearAllCreations = useCallback(async () => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const creationKeys = keys.filter(key => key.startsWith(creationKeyPrefix));

      await AsyncStorage.multiRemove(creationKeys);
      await fetchCreations();

      return true;
    } catch (error) {
      console.error('Error clearing creations:', error);

      return false;
    }
  }, [fetchCreations]);

  const copyCreationToFavorites = useCallback(async (creation) => {
    // Generate new ID for favorite to avoid conflicts
    const newId = Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    const favoriteItem = {
      id: newId,
      insult: creation.insult,
    };

    return await addFavorite(favoriteItem);
  }, [addFavorite]);

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
    creations,
    isLoadingCreations,
    fetchCreations,
    addCreation,
    removeCreation,
    clearAllCreations,
    copyCreationToFavorites,
  };

  return (
    <AppContext.Provider value={appConstants}>
      {children}
    </AppContext.Provider>
  );
};
