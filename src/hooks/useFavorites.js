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

import { useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppContext } from '../contexts/AppContext';

export const useFavorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { keyPrefix } = useAppContext();

  const fetchFavorites = useCallback(async () => {
    setIsLoading(true);
    try {
      const keys = await AsyncStorage.getAllKeys();
      const favoriteKeys = keys.filter(key => key.startsWith(keyPrefix));
      const favoritesList = [];
      
      for (const key of favoriteKeys) {
        const insult = await AsyncStorage.getItem(key);
        if (insult) favoritesList.push(JSON.parse(insult));
      }
      
      setFavorites(favoritesList);
    } catch (error) {
      console.error('Error fetching favorites:', error);
      setFavorites([]);
    } finally {
      setIsLoading(false);
    }
  }, [keyPrefix]);

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
  }, [keyPrefix, fetchFavorites]);

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
  }, [keyPrefix, fetchFavorites]);

  return { favorites, isLoading, fetchFavorites, addFavorite, removeFavorite };
};
