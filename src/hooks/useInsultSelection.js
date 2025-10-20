// Custom hook for managing insult selection state and actions
// Shared between InsultEmAll and FavoriteInsults

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

import { useState, useCallback } from 'react';
import * as Linking from 'expo-linking';

import { useClipboard } from './useClipboard';
import { useShare } from './useShare';
import { useHaptics } from './useHaptics';
import { useAppContext } from '../contexts/AppContext';

/**
 * Hook for managing insult selection and sharing
 * @param {string} mode - 'main' or 'favorites' - determines comparison key
 * @returns {object} Selection state and handlers
 */
export function useInsultSelection(mode = 'main') {
  const { smstag } = useAppContext();
  const { writeToClipboard } = useClipboard();
  const { shareInsult } = useShare();
  const haptics = useHaptics();

  const [selectedInsults, setSelectedInsults] = useState([]);

  // Determine comparison key based on mode
  const getKey = useCallback((item) => {
    return mode === 'favorites' ? item.id : item.insult;
  }, [mode]);

  // Extract insult text from item
  const getInsultText = useCallback((item) => {
    return item.insult || item;
  }, []);

  // Toggle selection of an insult
  const toggleSelection = useCallback((item) => {
    haptics.selection();

    const key = getKey(item);
    const isSelected = selectedInsults.some(selected => getKey(selected) === key);

    if (isSelected) {
      // Remove from selection
      setSelectedInsults(selectedInsults.filter(selected => getKey(selected) !== key));
    } else {
      // Add to selection
      const newSelection = [...selectedInsults, item];
      setSelectedInsults(newSelection);

      // Copy all selected insults to clipboard
      const insultTexts = newSelection.map(getInsultText).join('\n');
      writeToClipboard(insultTexts);
    }
  }, [selectedInsults, getKey, getInsultText, writeToClipboard, haptics]);

  // Check if an item is selected
  const isSelected = useCallback((item) => {
    const key = getKey(item);
    return selectedInsults.some(selected => getKey(selected) === key);
  }, [selectedInsults, getKey]);

  // Send selected insults via SMS
  const sendViaSMS = useCallback(() => {
    if (selectedInsults.length > 0) {
      haptics.medium();

      const combinedInsults = selectedInsults.map(getInsultText).join('\n');
      Linking.openURL(smstag + combinedInsults);
    }
  }, [selectedInsults, smstag, getInsultText, haptics]);

  // Share selected insults
  const shareSelected = useCallback(async () => {
    if (selectedInsults.length > 0) {
      haptics.medium();

      const combinedInsults = selectedInsults.map(getInsultText).join('\n');
      await shareInsult(combinedInsults);
    }
  }, [selectedInsults, shareInsult, getInsultText, haptics]);

  // Clear all selections
  const clearSelection = useCallback(() => {
    setSelectedInsults([]);
  }, []);

  return {
    selectedInsults,
    setSelectedInsults,
    toggleSelection,
    isSelected,
    sendViaSMS,
    shareSelected,
    clearSelection,
    hasSelection: selectedInsults.length > 0,
  };
}
