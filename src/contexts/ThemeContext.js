// Theme context for managing light/dark mode

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { lightColors, darkColors } from '../styles/colors';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
    const systemColorScheme = useColorScheme(); // 'light', 'dark', or null
    const [theme, setTheme] = useState(systemColorScheme || 'light');

    // Update theme when system preference changes
    useEffect(() => {
        console.log('System color scheme detected:', systemColorScheme);
        if (systemColorScheme) {
            setTheme(systemColorScheme);
            console.log('Theme updated to:', systemColorScheme);
        }
    }, [systemColorScheme]);

    const colors = theme === 'dark' ? darkColors : lightColors;

    const value = {
        theme,
        colors,
        isDark: theme === 'dark',
        setTheme, // Allow manual override if needed in the future
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
