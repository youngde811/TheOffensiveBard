// Custom hook for playing sound effects

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

import { useEffect, useRef } from 'react';
import { Audio } from 'expo-av';
import { useSettings, SOUND_EFFECTS } from '../contexts/SettingsContext';

// Sound file mappings
const SOUND_FILES = {
  [SOUND_EFFECTS.CHIME]: require('../../assets/sounds/point-in-space-36199.mp3'),
  [SOUND_EFFECTS.POP]: require('../../assets/sounds/light-bubble-pop-383738.mp3'),
};

// Fixed volume level (0.0 to 1.0) - set to a pleasant, low level
const SOUND_VOLUME = 0.3;

export function useSound() {
  const { hapticsEnabled, soundEffect } = useSettings();
  const soundObjects = useRef({});

  // Load sounds on mount
  useEffect(() => {
    const loadSounds = async () => {
      try {
        // Set audio mode for playback
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          staysActiveInBackground: false,
        });

        // Load all sound files with fixed volume
        for (const [key, source] of Object.entries(SOUND_FILES)) {
          const { sound } = await Audio.Sound.createAsync(
            source,
            { volume: SOUND_VOLUME }
          );
          soundObjects.current[key] = sound;
        }
      } catch (error) {
        console.error('Error loading sounds:', error);
      }
    };

    loadSounds();

    // Cleanup: unload all sounds on unmount
    return () => {
      Object.values(soundObjects.current).forEach(async (sound) => {
        try {
          await sound.unloadAsync();
        } catch (error) {
          console.error('Error unloading sound:', error);
        }
      });
    };
  }, []);

  // Play sound when haptics are disabled
  const playFavoriteSound = async () => {
    // Only play sound if haptics are disabled
    if (hapticsEnabled) {
      return;
    }

    try {
      const sound = soundObjects.current[soundEffect];
      if (sound) {
        // Rewind to start in case it was played recently
        await sound.setPositionAsync(0);
        await sound.playAsync();
      }
    } catch (error) {
      console.error('Error playing sound:', error);
    }
  };

  return {
    playFavoriteSound,
  };
}
