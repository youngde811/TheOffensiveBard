// -*- mode: rjsx; eval: (auto-fill-mode 1); -*-

// This component provides the Settings page for the app.

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

import React, { useState, useCallback } from 'react';
import { View, Text, Alert, ScrollView, Linking, StyleSheet, Switch } from 'react-native';
import Slider from '@react-native-community/slider';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import PressableOpacity from './PressableOpacity';
import InsultsHeader from './InsultsHeader';

import { useSettings, EASTER_EGG_FREQUENCY, SOUND_EFFECTS } from '../contexts/SettingsContext';
import { useAppContext } from '../contexts/AppContext';
import { useTheme, THEME_MODES } from '../contexts/ThemeContext';
import { useHaptics } from '../hooks/useHaptics';

import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Settings({ appConfig, setDismiss }) {
  const { colors, themePreference, setThemeMode } = useTheme();
  const { hapticsEnabled, toggleHaptics, easterEggFrequency, setEasterEggFrequency, soundEffect, setSoundEffect, soundVolume, setSoundVolume } = useSettings();
  const { keyPrefix, fetchFavorites } = useAppContext();

  const haptics = useHaptics();

  const [isClearing, setIsClearing] = useState(false);

  const handleClearFavorites = useCallback(() => {
    Alert.alert(
      'Clear All Favorites',
      'Are you sure you want to delete all your favorite insults? This cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => haptics.light(),
        },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            setIsClearing(true);

            try {
              const keys = await AsyncStorage.getAllKeys();
              const favoriteKeys = keys.filter(key => key.startsWith(keyPrefix));
              await AsyncStorage.multiRemove(favoriteKeys);
              await fetchFavorites();

              haptics.success();
              Alert.alert('Success', 'All favorites have been cleared.');
            } catch (error) {
              console.error('Error clearing favorites:', error);
              haptics.error();
              Alert.alert('Error', 'Failed to clear favorites. Please try again.');
            } finally {
              setIsClearing(false);
            }
          },
        },
      ]
    );
  }, [keyPrefix, fetchFavorites, haptics]);

  const handleEasterEggFrequencyChange = useCallback((frequency) => {
    haptics.selection();
    setEasterEggFrequency(frequency);
  }, [setEasterEggFrequency, haptics]);

  const handleThemeChange = useCallback((mode) => {
    haptics.selection();
    setThemeMode(mode);
  }, [setThemeMode, haptics]);

  const handleSoundEffectChange = useCallback((effect) => {
    haptics.selection();
    setSoundEffect(effect);
  }, [setSoundEffect, haptics]);

  const handleVolumeChange = useCallback((value) => {
    setSoundVolume(value);
  }, [setSoundVolume]);

  const handleVolumeChangeComplete = useCallback(() => {
    haptics.light();
  }, [haptics]);

  const openGitHub = useCallback(() => {
    haptics.light();
    Linking.openURL(appConfig.projectURL);
  }, [appConfig.projectURL, haptics]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="auto" />
        <View style={{ zIndex: 1000, elevation: 10 }}>
          <InsultsHeader appConfig={appConfig} />
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          {/* Appearance */}
          <View style={[styles.section, { backgroundColor: colors.surface }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Appearance</Text>
            <Text style={[styles.sectionDescription, { color: colors.textMuted }]}>
              Choose your preferred theme
            </Text>

            {Object.entries(THEME_MODES).map(([key, value]) => (
              <PressableOpacity
                key={key}
                style={styles.frequencyOption}
                onPress={() => handleThemeChange(value)}
              >
                <View style={styles.radioRow}>
                  <View style={[
                    styles.radio,
                    { borderColor: colors.primary }
                  ]}>
                    {themePreference === value && (
                      <View style={[styles.radioInner, { backgroundColor: colors.primary }]} />
                    )}
                  </View>
                  <View style={styles.frequencyInfo}>
                    <Text style={[styles.frequencyLabel, { color: colors.text }]}>
                      {key === 'SYSTEM' ? 'System Default' : key.charAt(0) + key.slice(1).toLowerCase()}
                    </Text>
                    <Text style={[styles.frequencyPercentage, { color: colors.textMuted }]}>
                      {key === 'SYSTEM' ? 'Follow device' : ''}
                    </Text>
                  </View>
                </View>
              </PressableOpacity>
            ))}
          </View>

          {/* Haptics Toggle */}
          <View style={[styles.section, { backgroundColor: colors.surface }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Preferences</Text>

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingLabel, { color: colors.text }]}>Haptic Feedback</Text>
                <Text style={[styles.settingDescription, { color: colors.textMuted }]}>
                  Vibrate on taps and selections
                </Text>
              </View>
              <Switch
                value={hapticsEnabled}
                onValueChange={toggleHaptics}
                trackColor={{ false: colors.divider, true: colors.primary }}
                thumbColor={hapticsEnabled ? colors.surface : colors.textMuted}
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.settingGroup}>
              <Text style={[styles.settingLabel, { color: colors.text }]}>Favorite Sound Effect</Text>
              <Text style={[styles.settingDescription, { color: colors.textMuted }]}>
                Sound to play when adding favorites (only when haptics are off)
              </Text>

              {Object.entries(SOUND_EFFECTS).map(([key, value]) => (
                <PressableOpacity
                  key={key}
                  style={styles.frequencyOption}
                  onPress={() => handleSoundEffectChange(value)}
                >
                  <View style={styles.radioRow}>
                    <View style={[
                      styles.radio,
                      { borderColor: colors.primary }
                    ]}>
                      {soundEffect === value && (
                        <View style={[styles.radioInner, { backgroundColor: colors.primary }]} />
                      )}
                    </View>
                    <Text style={[styles.frequencyLabel, { color: colors.text }]}>
                      {key.charAt(0) + key.slice(1).toLowerCase()}
                    </Text>
                  </View>
                </PressableOpacity>
              ))}
            </View>

            <View style={styles.divider} />

            <View style={styles.settingGroup}>
              <Text style={[styles.settingLabel, { color: hapticsEnabled ? colors.textMuted : colors.text }]}>Sound Volume</Text>
              <Text style={[styles.settingDescription, { color: colors.textMuted }]}>
                Adjust the volume of sound effects{hapticsEnabled ? ' (disabled when haptics are on)' : ''}
              </Text>

              <View style={[styles.volumeContainer, { opacity: hapticsEnabled ? 0.5 : 1 }]}>
                <Text style={[styles.volumeLabel, { color: colors.textMuted }]}>0%</Text>
                <Slider
                  style={styles.slider}
                  minimumValue={0}
                  maximumValue={100}
                  step={10}
                  value={soundVolume}
                  onValueChange={handleVolumeChange}
                  onSlidingComplete={handleVolumeChangeComplete}
                  minimumTrackTintColor={colors.primary}
                  maximumTrackTintColor={colors.divider}
                  thumbTintColor={colors.primary}
                  disabled={hapticsEnabled}
                />
                <Text style={[styles.volumeLabel, { color: colors.textMuted }]}>100%</Text>
              </View>
              <Text style={[styles.volumeValue, { color: hapticsEnabled ? colors.textMuted : colors.text }]}>
                Current: {soundVolume}%
              </Text>
            </View>
          </View>

          {/* Easter Egg Frequency */}
          <View style={[styles.section, { backgroundColor: colors.surface }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Easter Eggs</Text>
            <Text style={[styles.sectionDescription, { color: colors.textMuted }]}>
              How many insults should have seasonal easter egg icons?
            </Text>

            {Object.entries(EASTER_EGG_FREQUENCY).map(([key, { label, percentage }]) => (
              <PressableOpacity
                key={key}
                style={styles.frequencyOption}
                onPress={() => handleEasterEggFrequencyChange(key)}
              >
                <View style={styles.radioRow}>
                  <View style={[
                    styles.radio,
                    { borderColor: colors.primary }
                  ]}>
                    {easterEggFrequency === key && (
                      <View style={[styles.radioInner, { backgroundColor: colors.primary }]} />
                    )}
                  </View>
                  <View style={styles.frequencyInfo}>
                    <Text style={[styles.frequencyLabel, { color: colors.text }]}>
                      {label}
                    </Text>
                    <Text style={[styles.frequencyPercentage, { color: colors.textMuted }]}>
                      {percentage === 0 ? 'None' : `${(percentage * 100).toFixed(0)}%`}
                    </Text>
                  </View>
                </View>
              </PressableOpacity>
            ))}
          </View>

          {/* Clear Favorites */}
          <View style={[styles.section, { backgroundColor: colors.surface }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Data</Text>

            <PressableOpacity
              style={[styles.dangerButton, { opacity: isClearing ? 0.5 : 1 }]}
              onPress={handleClearFavorites}
              disabled={isClearing}
            >
              <Text style={styles.dangerButtonText}>
                {isClearing ? 'Clearing...' : 'Clear All Favorites'}
              </Text>
            </PressableOpacity>
          </View>

          {/* About/Credits */}
          <View style={[styles.section, { backgroundColor: colors.surface }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>About</Text>

            <View style={styles.aboutRow}>
              <Text style={[styles.aboutLabel, { color: colors.textMuted }]}>Version</Text>
              <Text style={[styles.aboutValue, { color: colors.text }]}>1.4.0</Text>
            </View>

            <View style={styles.aboutRow}>
              <Text style={[styles.aboutLabel, { color: colors.textMuted }]}>Author</Text>
              <Text style={[styles.aboutValue, { color: colors.text }]}>David E. Young</Text>
            </View>

            <View style={styles.aboutRow}>
              <Text style={[styles.aboutLabel, { color: colors.textMuted }]}>License</Text>
              <Text style={[styles.aboutValue, { color: colors.text }]}>MIT</Text>
            </View>

            <PressableOpacity
              style={[styles.linkButton, { borderColor: colors.primary }]}
              onPress={openGitHub}
            >
              <Text style={[styles.linkButtonText, { color: colors.primary }]}>
                View on GitHub
              </Text>
            </PressableOpacity>
          </View>
        </ScrollView>

        {/* Dismiss Button */}
        <View style={styles.footer}>
          <PressableOpacity
            style={[styles.dismissButton, { backgroundColor: colors.primary }]}
            onPress={setDismiss}
          >
            <Text style={styles.dismissButtonText}>Done</Text>
          </PressableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  section: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    lineHeight: 18,
  },
  frequencyOption: {
    paddingVertical: 12,
  },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  frequencyInfo: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  frequencyLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  frequencyPercentage: {
    fontSize: 14,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#e0e0e0',
    marginVertical: 16,
  },
  settingGroup: {
    marginTop: 8,
  },
  dangerButton: {
    backgroundColor: '#dc3545',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  dangerButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  aboutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e0e0e0',
  },
  aboutLabel: {
    fontSize: 15,
  },
  aboutValue: {
    fontSize: 15,
    fontWeight: '500',
  },
  linkButton: {
    borderWidth: 2,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  linkButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    paddingBottom: 20,
  },
  dismissButton: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  dismissButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
  },
  volumeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  volumeLabel: {
    fontSize: 13,
    fontWeight: '500',
    width: 40,
    textAlign: 'center',
  },
  slider: {
    flex: 1,
    height: 40,
    marginHorizontal: 8,
  },
  volumeValue: {
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 4,
  },
});
