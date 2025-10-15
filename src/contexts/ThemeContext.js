// Theme context for managing light/dark mode

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lightColors, darkColors } from '../styles/colors';

const ThemeContext = createContext();

const THEME_PREFERENCE_KEY = '@insolentbard:settings:themePreference';

// Theme preference options
export const THEME_MODES = {
    SYSTEM: 'system',
    LIGHT: 'light',
    DARK: 'dark',
};

export function ThemeProvider({ children }) {
    const systemColorScheme = useColorScheme(); // 'light', 'dark', or null
    const [themePreference, setThemePreference] = useState(THEME_MODES.SYSTEM);
    const [actualTheme, setActualTheme] = useState(systemColorScheme || 'light');

    // Load theme preference from storage on mount
    useEffect(() => {
        const loadThemePreference = async () => {
            try {
                const saved = await AsyncStorage.getItem(THEME_PREFERENCE_KEY);
                if (saved) {
                    setThemePreference(saved);
                }
            } catch (error) {
                console.error('Error loading theme preference:', error);
            }
        };
        loadThemePreference();
    }, []);

    // Update actual theme based on preference and system setting
    useEffect(() => {
        if (themePreference === THEME_MODES.SYSTEM) {
            // Follow system preference
            setActualTheme(systemColorScheme || 'light');
        } else {
            // Use user's explicit preference
            setActualTheme(themePreference);
        }
    }, [themePreference, systemColorScheme]);

    // Set theme preference and save to storage
    const setThemeMode = useCallback(async (mode) => {
        try {
            setThemePreference(mode);
            await AsyncStorage.setItem(THEME_PREFERENCE_KEY, mode);
        } catch (error) {
            console.error('Error saving theme preference:', error);
        }
    }, []);

    const colors = actualTheme === 'dark' ? darkColors : lightColors;

    const value = {
        theme: actualTheme,
        themePreference,
        colors,
        isDark: actualTheme === 'dark',
        setTheme: setActualTheme, // Direct theme setter (for backwards compatibility)
        setThemeMode, // Preference-based theme setter
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within ThemeProvider');
    }
    return context;
}
