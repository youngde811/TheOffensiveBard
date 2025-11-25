// -*- mode: rjsx; eval: (auto-fill-mode 1); -*-

// Mix Your Own - Custom insult creator screen

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

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { FlashList } from '@shopify/flash-list';
import { Swipeable } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '../contexts/ThemeContext';
import { useAppContext } from '../contexts/AppContext';
import { useHaptics } from '../hooks/useHaptics';
import { useShare } from '../hooks/useShare';
import { useInsultSelection } from '../hooks/useInsultSelection';

import WordChipSelector from '../components/WordChipSelector';
import PressableOpacity from './PressableOpacity';
import ScalableText from 'react-native-text';

import wordLists from '../../assets/data/word-lists.json';
import styles from '../styles/styles';

export default function MixYourOwn({ setDismiss }) {
  const { colors, isDark } = useTheme();
  const {
    creations,
    isLoadingCreations,
    fetchCreations,
    addCreation,
    removeCreation,
    clearAllCreations,
    copyCreationToFavorites,
  } = useAppContext();
  const haptics = useHaptics();
  const { shareInsult } = useShare();

  // Selection state for list items
  const {
    selectedInsults,
    toggleSelection,
    isSelected,
    sendViaSMS,
    shareSelected,
    hasSelection,
    clearSelection,
  } = useInsultSelection('creations');

  const [selectedAdj1, setSelectedAdj1] = useState(null);
  const [selectedAdj2, setSelectedAdj2] = useState(null);
  const [selectedNoun, setSelectedNoun] = useState(null);

  // Load creations on mount
  useEffect(() => {
    fetchCreations();
  }, [fetchCreations]);

  // Build the insult preview
  const previewInsult = selectedAdj1 && selectedAdj2 && selectedNoun
    ? `Thou ${selectedAdj1} ${selectedAdj2} ${selectedNoun}!`
    : null;

  const canAdd = previewInsult !== null;

  const handleRandomize = () => {
    haptics.medium();
    const randomAdj1 = wordLists.adjectives[Math.floor(Math.random() * wordLists.adjectives.length)];
    const randomAdj2 = wordLists.compoundAdjectives[Math.floor(Math.random() * wordLists.compoundAdjectives.length)];
    const randomNoun = wordLists.nouns[Math.floor(Math.random() * wordLists.nouns.length)];

    setSelectedAdj1(randomAdj1);
    setSelectedAdj2(randomAdj2);
    setSelectedNoun(randomNoun);
  };

  const handleAddToList = async () => {
    if (!previewInsult) return;

    haptics.medium();
    const result = await addCreation(previewInsult);

    if (result.success) {
      haptics.success();
      // Clear selections after successful add
      setSelectedAdj1(null);
      setSelectedAdj2(null);
      setSelectedNoun(null);
    } else if (result.reason === 'duplicate') {
      haptics.warning();
      Alert.alert('Duplicate', 'This insult is already in your creations!');
    } else {
      haptics.error();
      Alert.alert('Error', 'Failed to save your creation. Please try again.');
    }
  };

  const handleDelete = async (item) => {
    haptics.medium();
    await removeCreation(item);
  };

  const handleShare = async (item) => {
    haptics.light();
    await shareInsult(item.insult);
  };

  const handleCopyToFavorites = async (item) => {
    haptics.medium();
    const success = await copyCreationToFavorites(item);

    if (success) {
      haptics.success();
      Alert.alert('Copied!', 'Insult added to your Favorites.');
    } else {
      haptics.error();
      Alert.alert('Error', 'Failed to copy to favorites.');
    }
  };

  const handleClearAll = () => {
    if (creations.length === 0) return;

    Alert.alert(
      'Clear All Creations',
      'Are you sure you want to delete all your custom insults?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            haptics.heavy();
            await clearAllCreations();
          },
        },
      ]
    );
  };

  const renderCreationItem = ({ item }) => {
    return (
      <CreationListItem
        item={item}
        colors={colors}
        isSelected={isSelected(item)}
        onPress={() => toggleSelection(item)}
        onDelete={() => handleDelete(item)}
        onShare={() => handleShare(item)}
        onCopyToFavorites={() => handleCopyToFavorites(item)}
      />
    );
  };

  const renderEmptyState = () => (
    <View style={mixStyles.emptyState}>
      <Ionicons name="create-outline" size={48} color={colors.textMuted} />
      <Text style={[mixStyles.emptyText, { color: colors.textMuted }]}>
        Your custom insults will appear here.
      </Text>
      <Text style={[mixStyles.emptySubtext, { color: colors.textMuted }]}>
        Start mixing above!
      </Text>
    </View>
  );

  return (
    <View style={[styles.backgroundImage, { backgroundColor: colors.background }]}>
      <SafeAreaView style={mixStyles.container} edges={['bottom']}>
        <StatusBar style={isDark ? 'light' : 'dark'} />

        {/* Creator Section */}
        <View style={[mixStyles.creatorSection, { backgroundColor: colors.surfaceSecondary }]}>
          <WordChipSelector
            label="Adjective"
            words={wordLists.adjectives}
            selectedWord={selectedAdj1}
            onSelect={setSelectedAdj1}
          />

          <WordChipSelector
            label="Compound"
            words={wordLists.compoundAdjectives}
            selectedWord={selectedAdj2}
            onSelect={setSelectedAdj2}
          />

          <WordChipSelector
            label="Noun"
            words={wordLists.nouns}
            selectedWord={selectedNoun}
            onSelect={setSelectedNoun}
          />

          {/* Preview Card */}
          <View style={[mixStyles.previewCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {previewInsult ? (
              <Text style={[mixStyles.previewText, { color: colors.text }]}>
                {previewInsult}
              </Text>
            ) : (
              <Text style={[mixStyles.previewPlaceholder, { color: colors.textMuted }]}>
                Select words to craft your insult...
              </Text>
            )}
          </View>

          {/* Action Buttons */}
          <View style={mixStyles.actionRow}>
            <PressableOpacity
              style={[mixStyles.actionButton, { backgroundColor: colors.primaryVariant }]}
              onPress={handleRandomize}
            >
              <Ionicons name="shuffle" size={20} color="white" />
              <Text style={mixStyles.actionButtonText}>Randomize</Text>
            </PressableOpacity>

            <View style={mixStyles.buttonSpacer} />

            <PressableOpacity
              style={[
                mixStyles.actionButton,
                { backgroundColor: canAdd ? colors.primary : colors.disabled },
              ]}
              onPress={handleAddToList}
              disabled={!canAdd}
            >
              <Ionicons name="add-circle" size={20} color="white" />
              <Text style={mixStyles.actionButtonText}>Add to List</Text>
            </PressableOpacity>
          </View>
        </View>

        {/* Divider with count */}
        <View style={[mixStyles.divider, { borderBottomColor: colors.divider }]}>
          <Text style={[mixStyles.sectionTitle, { color: colors.text }]}>
            My Creations ({creations.length})
          </Text>
        </View>

        {/* Creations List */}
        <View style={mixStyles.listContainer}>
          {isLoadingCreations ? (
            <ActivityIndicator size="large" color={colors.primary} />
          ) : (
            <FlashList
              data={creations}
              keyExtractor={(item) => item.id}
              extraData={selectedInsults}
              renderItem={renderCreationItem}
              estimatedItemSize={60}
              ListEmptyComponent={renderEmptyState}
              contentContainerStyle={mixStyles.listContent}
            />
          )}
        </View>

        {/* Footer Buttons */}
        <View style={[mixStyles.footer, { backgroundColor: colors.background }]}>
          <PressableOpacity
            style={[
              mixStyles.footerButton,
              { backgroundColor: hasSelection ? colors.primaryVariant : colors.disabled },
            ]}
            onPress={sendViaSMS}
            disabled={!hasSelection}
          >
            <Text style={mixStyles.footerButtonText}>SMS</Text>
          </PressableOpacity>

          <View style={mixStyles.buttonSpacer} />

          <PressableOpacity
            style={[
              mixStyles.footerButton,
              { backgroundColor: hasSelection ? colors.primaryVariant : colors.disabled },
            ]}
            onPress={shareSelected}
            disabled={!hasSelection}
          >
            <Text style={mixStyles.footerButtonText}>Share</Text>
          </PressableOpacity>

          <View style={mixStyles.buttonSpacer} />

          <PressableOpacity
            style={[
              mixStyles.footerButton,
              { backgroundColor: creations.length > 0 ? '#c0392b' : colors.disabled },
            ]}
            onPress={handleClearAll}
            disabled={creations.length === 0}
          >
            <Text style={mixStyles.footerButtonText}>Clear All</Text>
          </PressableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

// Swipeable list item component
function CreationListItem({ item, colors, isSelected, onPress, onDelete, onShare, onCopyToFavorites }) {
  const swipeableRef = useRef(null);

  const renderLeftActions = () => (
    <View style={swipeItemStyles.leftActionsContainer}>
      <Animated.View style={swipeItemStyles.actionButton}>
        <PressableOpacity
          style={[swipeItemStyles.actionButtonInner, { backgroundColor: '#3498db' }]}
          onPress={() => {
            swipeableRef.current?.close();
            onShare();
          }}
        >
          <Ionicons name="share-outline" size={24} color="white" />
        </PressableOpacity>
      </Animated.View>
      <Animated.View style={swipeItemStyles.actionButton}>
        <PressableOpacity
          style={[swipeItemStyles.actionButtonInner, { backgroundColor: '#e74c3c' }]}
          onPress={() => {
            swipeableRef.current?.close();
            onCopyToFavorites();
          }}
        >
          <Ionicons name="heart" size={24} color="white" />
        </PressableOpacity>
      </Animated.View>
    </View>
  );

  const renderRightActions = () => (
    <View style={swipeItemStyles.rightActionsContainer}>
      <Animated.View style={swipeItemStyles.actionButton}>
        <PressableOpacity
          style={[swipeItemStyles.actionButtonInner, { backgroundColor: '#c0392b' }]}
          onPress={() => {
            swipeableRef.current?.close();
            onDelete();
          }}
        >
          <Ionicons name="trash-outline" size={24} color="white" />
        </PressableOpacity>
      </Animated.View>
    </View>
  );

  return (
    <Swipeable
      ref={swipeableRef}
      renderLeftActions={renderLeftActions}
      renderRightActions={renderRightActions}
      overshootLeft={false}
      overshootRight={false}
      friction={2}
    >
      <PressableOpacity onPress={onPress}>
        <View style={[styles.insultItemContainer, { backgroundColor: colors.surface }]}>
          <ScalableText
            style={[
              isSelected ? styles.insultSelectedText : styles.insultText,
              { color: isSelected ? colors.textSelected : colors.text }
            ]}
          >
            {item.insult}
          </ScalableText>
        </View>
      </PressableOpacity>
    </Swipeable>
  );
}

const mixStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  creatorSection: {
    padding: 12,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  previewCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 8,
    marginBottom: 12,
    minHeight: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewText: {
    fontFamily: 'BlackChancery',
    fontSize: 22,
    textAlign: 'center',
  },
  previewPlaceholder: {
    fontFamily: 'IMFellEnglish',
    fontSize: 16,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  actionButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 15,
    marginLeft: 8,
  },
  buttonSpacer: {
    width: 8,
  },
  divider: {
    borderBottomWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  listContainer: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 8,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 40,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 12,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 4,
    fontStyle: 'italic',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  footerButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
  },
  footerButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 15,
  },
});

const swipeItemStyles = StyleSheet.create({
  leftActionsContainer: {
    flexDirection: 'row',
    marginVertical: 4,
    marginLeft: 8,
  },
  rightActionsContainer: {
    flexDirection: 'row',
    marginVertical: 4,
    marginRight: 8,
  },
  actionButton: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonInner: {
    width: 56,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginHorizontal: 4,
  },
});
