// -*- mode: rjsx; eval: (auto-fill-mode 1); -*-

// This file contains the code for our TheOffensiveBard main insult page.
// Refactored to use modern React patterns with custom hooks and context.

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

import React, { useRef, useState, useMemo, useCallback, useEffect } from 'react';

import { Text, View, TouchableOpacity } from 'react-native';
import { FlashList } from "@shopify/flash-list";
import { Ionicons } from '@expo/vector-icons';

import * as Linking from 'expo-linking';

import styles from '../styles/styles.js';
import PressableOpacity from './PressableOpacity';
import FloatingPressable from './FloatingPressable';
import SwipeableInsultItem from './SwipeableInsultItem';
import OldEnglishOverlay from './OldEnglishOverlay';
import SearchBar from './SearchBar';
import InsultsHeader from './InsultsHeader';
import InsultImageTemplate from '../components/InsultImageTemplate';

import { useAppContext } from '../contexts/AppContext';
import { useClipboard } from '../hooks/useClipboard';
import { useShare } from '../hooks/useShare';
import { useHaptics } from '../hooks/useHaptics';
import { useSound } from '../hooks/useSound';
import { useTheme } from '../contexts/ThemeContext';
import { useSettings } from '../contexts/SettingsContext';
import { useInsultOfTheHour } from '../hooks/useInsultOfTheHour';
import { useImageShare } from '../hooks/useImageShare';

import * as Utilities from '../utils/utilities';

export default function InsultEmAll({ insults, appConfig, onRefresh }) {
  const { season, smstag, addFavorite } = useAppContext();
  const { writeToClipboard } = useClipboard();
  const { shareInsult } = useShare();
  
  const haptics = useHaptics();

  const { playFavoriteSound } = useSound();
  const { colors } = useTheme();
  const { getEasterEggCount } = useSettings();
  const { currentInsult: insultOfTheHour, isRefreshing, refreshInsult } = useInsultOfTheHour(insults);
  const { imageRef, isGenerating, shareAsImage } = useImageShare();

  const [selectedInsults, setSelectedInsults] = useState([]);
  const [insultToShare, setInsultToShare] = useState(null);
  const [listVerticalOffset, setListVerticalOffset] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [easterEggIndices, setEasterEggIndices] = useState(new Set());
  const [overlayVisible, setOverlayVisible] = useState(false);
  const [overlayInsult, setOverlayInsult] = useState('');
  const [overlayPosition, setOverlayPosition] = useState({ x: 0, y: 0 });

  const seasonalIcon = useMemo(() => Utilities.getSeasonalIcon(season), [season]);

  // Select random insults for easter eggs based on settings
  useEffect(() => {
    const selectRandomEggs = () => {
      const eggCount = getEasterEggCount(insults.length);
      const indices = new Set();
      const maxIndex = insults.length;

      if (eggCount === 0) {
        setEasterEggIndices(new Set());
        
        return;
      }

      while (indices.size < eggCount) {
        const randomIndex = Math.floor(Math.random() * maxIndex);
        indices.add(randomIndex);
      }

      setEasterEggIndices(indices);
    };

    selectRandomEggs();
  }, [insults, getEasterEggCount]);

  // Filter insults based on search query
  const filteredInsults = useMemo(() => {
    if (!searchQuery.trim()) {
      return insults;
    }
    
    const query = searchQuery.toLowerCase();

    return insults.filter(item =>
      item.insult.toLowerCase().includes(query)
    );
  }, [insults, searchQuery]);

  const memoizedInsults = useMemo(() => filteredInsults, [filteredInsults]);

  const listThreshold = 300;
  const listRef = useRef(null);

  const insultSelect = useCallback((item) => {
    haptics.selection();

    const isSelected = selectedInsults.some(selected => selected === item.insult);

    if (isSelected) {
      // Remove from selection
      setSelectedInsults(selectedInsults.filter(selected => selected !== item.insult));
    } else {
      // Add to selection
      const newSelection = [...selectedInsults, item.insult];
      setSelectedInsults(newSelection);
      
      // Copy all selected insults to clipboard
      writeToClipboard(newSelection.join('\n'));
    }
  }, [selectedInsults, writeToClipboard, haptics]);

  const showEasterEgg = useCallback((item, position) => {
    haptics.light();
    setOverlayPosition(position);
    setOverlayInsult(item.insult);
    setOverlayVisible(true);
  }, [haptics]);

  const shareEasterEgg = useCallback((item) => {
    haptics.medium();
    const insultText = item.insult || item;
    setInsultToShare(insultText);
  }, [haptics]);

  const storeFavorite = useCallback(async (item) => {
    const success = await addFavorite(item);
    
    if (success) {
      haptics.success();

      await playFavoriteSound();
    }
  }, [addFavorite, haptics, playFavoriteSound]);

  const renderInsult = useCallback(({ item, index }) => {
    const hasEgg = easterEggIndices.has(index);
    const isSelected = selectedInsults.some(selected => selected === item.insult);

    return (
      <SwipeableInsultItem
        item={item}
        index={index}
        isSelected={isSelected}
        hasEgg={hasEgg}
        seasonalIcon={seasonalIcon}
        onPress={() => insultSelect(item)}
        onLongPress={() => storeFavorite(item)}
        onFavorite={() => storeFavorite(item)}
        onShare={() => handleShareInsultAsImage(item)}
        onEggPress={(position) => showEasterEgg(item, position)}
        onEggLongPress={() => shareEasterEgg(item)}
        colors={colors}
      />
    );
  }, [selectedInsults, seasonalIcon, insultSelect, storeFavorite, showEasterEgg, shareEasterEgg, handleShareInsultAsImage, colors, easterEggIndices]);

  const sendInsult = useCallback(() => {
    if (selectedInsults.length > 0) {
      haptics.medium();
      
      const combinedInsults = selectedInsults.join('\n');
      Linking.openURL(smstag + combinedInsults);
    }
  }, [selectedInsults, smstag, haptics]);

  const handleShare = useCallback(async () => {
    if (selectedInsults.length > 0) {
      haptics.medium();
      
      const combinedInsults = selectedInsults.join('\n');
      await shareInsult(combinedInsults);
    }
  }, [selectedInsults, shareInsult, haptics]);

  const scrollToTop = useCallback(() => {
    listRef.current?.scrollToOffset({ offset: 0, animated: true });
  }, []);

  const extractKeys = useCallback((item) => {
    return item.id;
  }, []);

  const setVerticalOffset = useCallback((event) => {
    setListVerticalOffset(event.nativeEvent.contentOffset.y);
  }, []);

  const toggleSearch = useCallback(() => {
    haptics.light();
    
    setIsSearchVisible(!isSearchVisible);

    if (isSearchVisible && searchQuery) {
      setSearchQuery('');
    }
  }, [isSearchVisible, searchQuery, haptics]);

  const clearSearch = useCallback(() => {
    haptics.light();
    
    setSearchQuery('');
  }, [haptics]);

  const handleRefresh = useCallback(() => {
    haptics.medium();
    // Call parent's refresh function to reload insults
    if (onRefresh) {
      onRefresh();
    }
    // Easter eggs will be re-selected automatically via useEffect when insults change
  }, [onRefresh, haptics]);

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

  return (
    <View style={styles.insultTopView}>
      <View style={{ zIndex: 1000, elevation: 10 }}>
        <InsultsHeader
          appConfig={appConfig}
          onRefreshPress={handleRefresh}
          onSearchPress={toggleSearch}
          isSearchActive={isSearchVisible}
          insultOfTheHour={insultOfTheHour}
          isRefreshing={isRefreshing}
          onInsultPress={handleInsultOfTheHourPress}
        />
        <SearchBar
          isVisible={isSearchVisible}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onClear={clearSearch}
          resultCount={filteredInsults.length}
        />
      </View>
      <View style={styles.insultSurfaceParent}>
        <View style={[styles.insultSurface, { backgroundColor: colors.surface }]}>
          <View style={styles.flatList}>
            <FlashList
              ref={listRef}
              onScroll={setVerticalOffset}
              data={memoizedInsults}
              keyExtractor={extractKeys}
              showsVerticalScrollIndicator={true}
              estimatedItemSize={80}
              extraData={selectedInsults}
              contentContainerStyle={{ paddingTop: 10 }}
              renderItem={renderInsult} />
            {listVerticalOffset > listThreshold && (
              <FloatingPressable onPress={scrollToTop} />
            )}
          </View>
        </View>
      </View>
      <View style={styles.insultFooter}>
        <PressableOpacity
          style={selectedInsults.length > 0 ? styles.insultButtons : styles.disabledInsultButtons}
          title={'SMS'}
          onPress={sendInsult}
          disabled={selectedInsults.length === 0}>
          <Text style={styles.insultButtonText}>SMS</Text>
        </PressableOpacity>
        <View style={styles.spacer} />
        <PressableOpacity
          style={selectedInsults.length > 0 ? styles.insultButtons : styles.disabledInsultButtons}
          title={'Share'}
          onPress={handleShare}
          disabled={selectedInsults.length === 0}>
          <Text style={styles.insultButtonText}>Share</Text>
        </PressableOpacity>
      </View>
      <OldEnglishOverlay
        insultText={overlayInsult}
        visible={overlayVisible}
        onDismiss={() => setOverlayVisible(false)}
        position={overlayPosition}
      />
      {/* Hidden view for image generation */}
      <View style={{ position: 'absolute', left: -10000, top: -10000 }} collapsable={false}>
        <View ref={imageRef} collapsable={false}>
          <InsultImageTemplate insultText={insultToShare || ''} />
        </View>
      </View>
    </View>
  );
}
