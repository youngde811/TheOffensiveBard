// -*- mode: rjsx; eval: (auto-fill-mode 1); -*-

// REFACTORED VERSION - This file shows the FavoriteInsults component using the new shared hook and component
// Compare this to the original FavoriteInsults.jsx to see the improvements

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

import React, { useEffect, useState, useCallback } from 'react';

import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FlashList } from "@shopify/flash-list";

import styles from '../styles/styles.js';
import SwipeableInsultItem from './SwipeableInsultItem';
import NoFavorites from './NoFavorites';
import InsultsHeader from './InsultsHeader';
import InsultImageTemplate from '../components/InsultImageTemplate';
import InsultListFooter from '../components/InsultListFooter';

import { useAppContext } from '../contexts/AppContext';
import { useHaptics } from '../hooks/useHaptics';
import { useTheme } from '../contexts/ThemeContext';
import { useInsultOfTheHour } from '../hooks/useInsultOfTheHour';
import { useImageShare } from '../hooks/useImageShare';
import { useInsultSelection } from '../hooks/useInsultSelection';

export default function FavoriteInsults({ appConfig, setDismiss }) {
  const { colors } = useTheme();
  const { favorites, isLoadingFavorites, fetchFavorites, removeFavorite } = useAppContext();

  const haptics = useHaptics();

  const { currentInsult: insultOfTheHour, isRefreshing } = useInsultOfTheHour(favorites);
  const { imageRef, isGenerating, shareAsImage } = useImageShare();

  // Use the new shared selection hook
  const {
    selectedInsults,
    setSelectedInsults,
    toggleSelection,
    isSelected,
    sendViaSMS,
    shareSelected,
    hasSelection,
  } = useInsultSelection('favorites');

  const [insultToShare, setInsultToShare] = useState(null);

  const renderInsult = useCallback(({ item, index }) => {
    const selected = isSelected(item);

    return (
      <SwipeableInsultItem
        item={item}
        index={index}
        isSelected={selected}
        hasEgg={false}
        seasonalIcon=""
        onPress={() => toggleSelection(item)}
        onLongPress={() => {}}
        onFavorite={async () => {
          haptics.light();
          await removeFavorite(item);
        }}
        onShare={() => handleShareInsultAsImage(item)}
        onEggPress={() => {}}
        onEggLongPress={() => {}}
        colors={colors}
        favoriteIcon="trash-outline"
        favoriteColor="#e74c3c"
      />
    );
  }, [isSelected, toggleSelection, removeFavorite, handleShareInsultAsImage, haptics, colors]);

  const forgetFavorite = useCallback(async () => {
    if (selectedInsults.length > 0) {
      haptics.light();

      // Remove all selected favorites
      for (const item of selectedInsults) {
        await removeFavorite(item);
      }

      setSelectedInsults([]);
    }
  }, [selectedInsults, removeFavorite, setSelectedInsults, haptics]);

  const handleInsultOfTheHourPress = useCallback(async () => {
    if (insultOfTheHour) {
      haptics.light();

      const insultText = insultOfTheHour.insult || insultOfTheHour;
      setInsultToShare(insultText);
    }
  }, [insultOfTheHour, haptics]);

  const handleShareInsultAsImage = useCallback((item) => {
    haptics.light();

    const insultText = item.insult || item;
    setInsultToShare(insultText);
  }, [haptics]);

  // Trigger image sharing when insultToShare is set
  useEffect(() => {
    if (insultToShare && !isGenerating) {
      shareAsImage(insultToShare).then(() => {
        setInsultToShare(null);
      });
    }
  }, [insultToShare, isGenerating, shareAsImage]);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const renderFavorites = () => {
    if (isLoadingFavorites) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={{ marginTop: 10, color: colors.textMuted }}>Loading favorites...</Text>
        </View>
      );
    }

    if (favorites.length === 0) {
      return null;
    }

    return (
      <FlashList
        data={favorites}
        keyExtractor={(item) => item.id}
        extraData={selectedInsults}
        estimatedItemSize={80}
        renderItem={renderInsult} />
    );
  };

  // Define footer buttons configuration
  const footerButtons = [
    {
      label: 'SMS',
      onPress: sendViaSMS,
      requiresSelection: true,
    },
    {
      label: 'Share',
      onPress: shareSelected,
      requiresSelection: true,
    },
    {
      label: 'Forget',
      onPress: forgetFavorite,
      requiresSelection: true,
    },
    {
      label: 'Dismiss',
      onPress: setDismiss,
      requiresSelection: false, // Always enabled
    },
  ];

  return (
    <View style={[styles.backgroundImage, { backgroundColor: colors.background }]}>
      <SafeAreaView style={styles.favoritesTopView}>
        <StatusBar style="auto" />
        <View style={{ zIndex: 1000, elevation: 10 }}>
          <InsultsHeader
            appConfig={appConfig}
            insultOfTheHour={insultOfTheHour}
            isRefreshing={isRefreshing}
            onInsultPress={handleInsultOfTheHourPress}
          />
        </View>
        {favorites.length === 0 && !isLoadingFavorites ?
          <NoFavorites />
          :
          <View style={styles.favoritesSurface}>
            <View style={{ flex: 1, backgroundColor: colors.surface, borderRadius: 16, padding: 0, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84, elevation: 4 }}>
              <View style={styles.favoritesListView}>
                {renderFavorites()}
              </View>
            </View>
          </View>
        }
        {/* Use the new shared footer component */}
        <InsultListFooter
          buttons={footerButtons}
          hasSelection={hasSelection}
          mode="favorites"
        />
      </SafeAreaView>
      {/* Hidden view for image generation */}
      <View style={{ position: 'absolute', left: -10000, top: -10000 }} collapsable={false}>
        <View ref={imageRef} collapsable={false}>
          <InsultImageTemplate insultText={insultToShare || ''} />
        </View>
      </View>
    </View>
  );
}
