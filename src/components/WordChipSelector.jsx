// Word chip selector component for Mix Your Own feature

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
import { View, Text, FlatList, StyleSheet, Pressable } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useHaptics } from '../hooks/useHaptics';

export default function WordChipSelector({ label, words, selectedWord, onSelect }) {
  const { colors } = useTheme();
  const haptics = useHaptics();

  const handleSelect = (word) => {
    haptics.selection();
    // Toggle: if already selected, deselect (set to null)
    if (word === selectedWord) {
      onSelect(null);
    } else {
      onSelect(word);
    }
  };

  const renderChip = ({ item }) => {
    const isSelected = item === selectedWord;

    return (
      <Pressable
        onPress={() => handleSelect(item)}
        style={({ pressed }) => [
          chipStyles.chip,
          {
            backgroundColor: isSelected ? colors.primary : colors.surface,
            borderColor: isSelected ? colors.primary : colors.border,
            opacity: pressed ? 0.7 : 1,
          },
        ]}
      >
        <Text
          style={[
            chipStyles.chipText,
            {
              color: isSelected ? 'white' : colors.text,
              fontFamily: 'IMFellEnglish',
            },
          ]}
        >
          {item}
        </Text>
      </Pressable>
    );
  };

  return (
    <View style={chipStyles.container}>
      <Text style={[chipStyles.label, { color: colors.textMuted }]}>{label}</Text>
      <FlatList
        horizontal
        data={words}
        keyExtractor={(item) => item}
        renderItem={renderChip}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={chipStyles.listContent}
      />
    </View>
  );
}

const chipStyles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
    marginLeft: 4,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  listContent: {
    paddingHorizontal: 4,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  chipText: {
    fontSize: 14,
  },
});
