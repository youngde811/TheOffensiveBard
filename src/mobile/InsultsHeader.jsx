// -*- mode: rjsx; eval: (auto-fill-mode 1); -*-

// This component creates a nice, clean header for our main insult page.

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

import React, { useState } from 'react';

import { Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import styles from '../styles/styles.js';
import { useAppContext } from '../contexts/AppContext';
import { useTheme } from '../contexts/ThemeContext';

export default function InsultsHeader({ appConfig, onSearchPress, isSearchActive }) {
    const { season, year } = useAppContext();
    const { colors } = useTheme();

    return (
        <View style={ [styles.listHeaderView, { backgroundColor: colors.surfaceSecondary }] }>
          <Text style={ [styles.listHeaderSeason, { color: colors.primary }] }>
            { season + ", " + year }
          </Text>
          {onSearchPress && (
            <TouchableOpacity style={ styles.searchToggleButton } onPress={ onSearchPress }>
              <Ionicons
                name={isSearchActive ? "close" : "search"}
                size={22}
                color={colors.primary}
              />
            </TouchableOpacity>
          )}
        </View>
    );
}
