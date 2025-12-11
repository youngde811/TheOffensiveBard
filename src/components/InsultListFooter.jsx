// -*- mode: rjsx; eval: (auto-fill-mode 1); -*-

// Shared footer component for insult lists with configurable action buttons

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

import React from 'react';
import { View, Text } from 'react-native';
import PressableOpacity from '../mobile/PressableOpacity';
import styles from '../styles/styles.js';
import { useTheme } from '../contexts/ThemeContext';

/**
 * Configurable footer component for insult lists
 * @param {array} buttons - Array of button configurations
 * @param {boolean} hasSelection - Whether any insults are selected
 * @param {string} mode - 'main' or 'favorites' - determines styling
 */
export default function InsultListFooter({ buttons, hasSelection, mode = 'main' }) {
  const { colors } = useTheme();
  const buttonStyle = mode === 'favorites' ? 'favoritesButtons' : 'insultButtons';
  const disabledStyle = mode === 'favorites' ? 'disabledFavoritesButtons' : 'disabledInsultButtons';
  const textStyle = mode === 'favorites' ? 'favoritesButtonText' : 'insultButtonText';
  const footerStyle = mode === 'favorites' ? 'favoritesFooter' : 'insultFooter';

  return (
    <View style={styles[footerStyle]}>
      {buttons.map((button, index) => {
        const isDisabled = button.requiresSelection && !hasSelection;
        return (
          <React.Fragment key={button.label}>
            {index > 0 && <View style={styles.spacer} />}
            <PressableOpacity
              style={[
                styles[isDisabled ? disabledStyle : buttonStyle],
                isDisabled && { backgroundColor: colors.disabled },
              ]}
              title={button.label}
              onPress={button.onPress}
              disabled={isDisabled}>
              <Text style={styles[textStyle]}>{button.label}</Text>
            </PressableOpacity>
          </React.Fragment>
        );
      })}
    </View>
  );
}
