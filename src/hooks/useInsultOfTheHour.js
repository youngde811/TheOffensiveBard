// Custom hook for managing the "Insult of the Hour" feature

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

import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSettings } from '../contexts/SettingsContext';
import { shareInsultWithWidget } from '../utils/widgetDataShare';

const STORAGE_KEY = '@insolentbard:insultOfTheHour';

// Get a unique identifier based on interval (year-month-day-hour-minute)
// For intervals: 5min, 15min, 30min, 60min
const getCurrentIntervalKey = (intervalMinutes) => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const date = now.getDate();
  const hour = now.getHours();
  const minute = now.getMinutes();

  // Calculate which interval block we're in
  const intervalBlock = Math.floor(minute / intervalMinutes);

  return `${year}-${month}-${date}-${hour}-${intervalBlock}`;
};

export function useInsultOfTheHour(insults) {
  const { getInsultRefreshIntervalMinutes } = useSettings();
  const [currentInsult, setCurrentInsult] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Select a random insult from the list
  const selectRandomInsult = useCallback(() => {
    if (!insults || insults.length === 0) {
      
      return null;
    }
    
    const randomIndex = Math.floor(Math.random() * insults.length);
    return insults[randomIndex];
  }, [insults]);

  // Load or generate the insult of the hour
  const loadInsultOfTheHour = useCallback(async () => {
    try {
      const intervalMinutes = getInsultRefreshIntervalMinutes();
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      const currentIntervalKey = getCurrentIntervalKey(intervalMinutes);

      if (stored) {
        const { insult, intervalKey } = JSON.parse(stored);

        // If it's still the same interval, use the stored insult
        if (intervalKey === currentIntervalKey && insult) {
          setCurrentInsult(insult);
          
          return;
        }
      }

      // Generate new insult for this interval
      const newInsult = selectRandomInsult();

      if (newInsult) {
        await AsyncStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            insult: newInsult,
            intervalKey: currentIntervalKey,
          })
        );

        setCurrentInsult(newInsult);

        // Share with widget (extract text from object)
        const insultText = newInsult.insult || newInsult;
        await shareInsultWithWidget(insultText);
      }
    } catch (error) {
      console.error('Error loading insult of the hour:', error);
      
      // Fallback to random insult
      setCurrentInsult(selectRandomInsult());
    }
  }, [selectRandomInsult, getInsultRefreshIntervalMinutes]);

  // Refresh the insult (with animation trigger)
  const refreshInsult = useCallback(async () => {
    setIsRefreshing(true);

    const newInsult = selectRandomInsult();
    const intervalMinutes = getInsultRefreshIntervalMinutes();
    const currentIntervalKey = getCurrentIntervalKey(intervalMinutes);

    try {
      await AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          insult: newInsult,
          intervalKey: currentIntervalKey,
        })
      );

      // Share with widget (extract text from object)
      const insultText = newInsult.insult || newInsult;
      await shareInsultWithWidget(insultText);

      // Small delay to show animation
      setTimeout(() => {
        setCurrentInsult(newInsult);
        setIsRefreshing(false);
      }, 300);
    } catch (error) {
      console.error('Error refreshing insult:', error);

      setCurrentInsult(newInsult);
      setIsRefreshing(false);
    }
  }, [selectRandomInsult, getInsultRefreshIntervalMinutes]);

  // Load on mount and when insults change
  useEffect(() => {
    loadInsultOfTheHour();
  }, [loadInsultOfTheHour]);

  // Check every minute if the hour has changed
  useEffect(() => {
    const interval = setInterval(() => {
      loadInsultOfTheHour();
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [loadInsultOfTheHour]);

  return {
    currentInsult,
    isRefreshing,
    refreshInsult,
  };
}
