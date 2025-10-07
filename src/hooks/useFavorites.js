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
