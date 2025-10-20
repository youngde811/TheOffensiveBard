// -*- mode: rjsx; eval: (auto-fill-mode 1); -*-

// This component renders an Old English text overlay for easter egg insults.

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

import React, { useEffect, useRef } from 'react';
import { Animated, Text, StyleSheet, Pressable } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

export default function OldEnglishOverlay({ insultText, visible, onDismiss, position }) {
  const { colors } = useTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-20)).current;

  useEffect(() => {
    if (visible) {
      // Animate in
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 80,
          friction: 8,
          useNativeDriver: true,
        })
      ]).start();

      // Auto-dismiss after 3 seconds
      const timer = setTimeout(() => {
        dismissOverlay();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [visible]); // eslint-disable-line consistent-return

  const dismissOverlay = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 20,
        duration: 300,
        useNativeDriver: true,
      })
    ]).start(() => {
      onDismiss();
    });
  };

  if (!visible) {
    return null;
  }

  return (
    <Pressable
      style={styles.overlay}
      onPress={dismissOverlay}>
      <Animated.View
        style={[
          styles.overlayContent,
          {
            backgroundColor: colors.surfaceSecondary,
            borderColor: colors.primary,
            opacity: fadeAnim,
            position: 'absolute',
            top: (position?.y || 200) - 60,
            left: 20,
            right: 20,
            transform: [
              { translateY: slideAnim }
            ]
          }
        ]}>
        <Text style={[
          styles.oldEnglishText,
          { color: colors.text }
        ]}>
          {insultText}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    zIndex: 9999,
  },
  overlayContent: {
    padding: 20,
    borderRadius: 15,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  oldEnglishText: {
    fontFamily: 'BlackChancery',
    fontSize: 24,
    textAlign: 'center',
    lineHeight: 32,
  },
});
