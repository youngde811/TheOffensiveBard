// Settings context for managing app preferences

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

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SettingsContext = createContext();

// Easter egg frequency percentages
export const EASTER_EGG_FREQUENCY = {
  OFF: { label: 'Off', percentage: 0 },
  FEW: { label: 'Few', percentage: 0.02 },       // 2%
  NORMAL: { label: 'Normal', percentage: 0.08 }, // 8%
  MANY: { label: 'Many', percentage: 0.15 },     // 15%
};

// Sound effect types
export const SOUND_EFFECTS = {
  CHIME: 'chime',
  POP: 'pop',
};

// Insult refresh intervals (in minutes)
export const INSULT_REFRESH_INTERVALS = {
  FIVE: { label: '5 minutes', minutes: 5 },
  FIFTEEN: { label: '15 minutes', minutes: 15 },
  THIRTY: { label: '30 minutes', minutes: 30 },
  SIXTY: { label: '60 minutes', minutes: 60 },
};

const SETTINGS_KEYS = {
  HAPTICS_ENABLED: '@insolentbard:settings:haptics',
  EASTER_EGG_FREQUENCY: '@insolentbard:settings:easterEggFrequency',
  SOUND_EFFECT: '@insolentbard:settings:soundEffect',
  SOUND_VOLUME: '@insolentbard:settings:soundVolume',
  INSULT_REFRESH_INTERVAL: '@insolentbard:settings:insultRefreshInterval',
};

// Default sound volume (30%)
const DEFAULT_SOUND_VOLUME = 30;

export function SettingsProvider({ children }) {
  const [hapticsEnabled, setHapticsEnabled] = useState(true);
  const [easterEggFrequency, setEasterEggFrequency] = useState('NORMAL');
  const [soundEffect, setSoundEffect] = useState(SOUND_EFFECTS.CHIME);
  const [soundVolume, setSoundVolume] = useState(DEFAULT_SOUND_VOLUME);
  const [insultRefreshInterval, setInsultRefreshInterval] = useState('SIXTY');
  const [isLoading, setIsLoading] = useState(true);

  // Load settings from AsyncStorage on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const [haptics, frequency, sound, volume, interval] = await Promise.all([
          AsyncStorage.getItem(SETTINGS_KEYS.HAPTICS_ENABLED),
          AsyncStorage.getItem(SETTINGS_KEYS.EASTER_EGG_FREQUENCY),
          AsyncStorage.getItem(SETTINGS_KEYS.SOUND_EFFECT),
          AsyncStorage.getItem(SETTINGS_KEYS.SOUND_VOLUME),
          AsyncStorage.getItem(SETTINGS_KEYS.INSULT_REFRESH_INTERVAL),
        ]);

        if (haptics !== null) {
          setHapticsEnabled(JSON.parse(haptics));
        }
        if (frequency !== null) {
          setEasterEggFrequency(frequency);
        }
        if (sound !== null) {
          setSoundEffect(sound);
        }
        if (volume !== null) {
          setSoundVolume(parseInt(volume, 10));
        }
        if (interval !== null) {
          setInsultRefreshInterval(interval);
        }
      } catch (error) {
        console.error('Error loading settings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, []);

  // Toggle haptics
  const toggleHaptics = useCallback(async () => {
    try {
      const newValue = !hapticsEnabled;
      setHapticsEnabled(newValue);
      
      await AsyncStorage.setItem(SETTINGS_KEYS.HAPTICS_ENABLED, JSON.stringify(newValue));
    } catch (error) {
      console.error('Error saving haptics setting:', error);
    }
  }, [hapticsEnabled]);

  // Set easter egg frequency
  const setEasterEggFreq = useCallback(async (frequency) => {
    try {
      setEasterEggFrequency(frequency);
      
      await AsyncStorage.setItem(SETTINGS_KEYS.EASTER_EGG_FREQUENCY, frequency);
    } catch (error) {
      console.error('Error saving easter egg frequency:', error);
    }
  }, []);

  // Calculate number of easter eggs based on insult count
  const getEasterEggCount = useCallback((insultCount) => {
    const percentage = EASTER_EGG_FREQUENCY[easterEggFrequency].percentage;
    
    return Math.floor(insultCount * percentage);
  }, [easterEggFrequency]);

  // Set sound effect preference
  const setSoundEffectPref = useCallback(async (effect) => {
    try {
      setSoundEffect(effect);
      
      await AsyncStorage.setItem(SETTINGS_KEYS.SOUND_EFFECT, effect);
    } catch (error) {
      console.error('Error saving sound effect setting:', error);
    }
  }, []);

  // Set sound volume (0-100)
  const setSoundVolumePref = useCallback(async (volume) => {
    try {
      setSoundVolume(volume);

      await AsyncStorage.setItem(SETTINGS_KEYS.SOUND_VOLUME, volume.toString());
    } catch (error) {
      console.error('Error saving sound volume setting:', error);
    }
  }, []);

  // Set insult refresh interval
  const setInsultRefreshIntervalPref = useCallback(async (interval) => {
    try {
      setInsultRefreshInterval(interval);

      await AsyncStorage.setItem(SETTINGS_KEYS.INSULT_REFRESH_INTERVAL, interval);
    } catch (error) {
      console.error('Error saving insult refresh interval setting:', error);
    }
  }, []);

  // Get interval in minutes
  const getInsultRefreshIntervalMinutes = useCallback(() => {
    return INSULT_REFRESH_INTERVALS[insultRefreshInterval].minutes;
  }, [insultRefreshInterval]);

  const value = {
    hapticsEnabled,
    toggleHaptics,
    easterEggFrequency,
    setEasterEggFrequency: setEasterEggFreq,
    getEasterEggCount,
    soundEffect,
    setSoundEffect: setSoundEffectPref,
    soundVolume,
    setSoundVolume: setSoundVolumePref,
    insultRefreshInterval,
    setInsultRefreshInterval: setInsultRefreshIntervalPref,
    getInsultRefreshIntervalMinutes,
    isLoading,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  
  if (!context) {
    throw new Error('useSettings must be used within SettingsProvider');
  }

  return context;
}
