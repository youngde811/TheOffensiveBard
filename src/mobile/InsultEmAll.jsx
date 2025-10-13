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

import React, { useRef, useState, useMemo, useCallback } from 'react';

import { Text, View } from 'react-native';
import { Divider } from "@rneui/themed";
import { Surface } from 'react-native-paper';
import { FlashList } from "@shopify/flash-list";

import * as Linking from 'expo-linking';

import styles from '../styles/styles.js';
import PressableOpacity from './PressableOpacity';
import FloatingPressable from './FloatingPressable';
import TouchableIcon from './TouchableIcon';
import ModalEmbeddedWebView from './ModalEmbeddedWebView';
import ScalableText from 'react-native-text';
import SearchBar from './SearchBar';
import InsultsHeader from './InsultsHeader';

import { useAppContext } from '../contexts/AppContext';
import { useClipboard } from '../hooks/useClipboard';
import { useShare } from '../hooks/useShare';
import { useHaptics } from '../hooks/useHaptics';
import { useTheme } from '../contexts/ThemeContext';

import * as Utilities from '../utils/utilities';

export default function InsultEmAll({ insults, appConfig }) {
    const { season, smstag, addFavorite } = useAppContext();
    const { writeToClipboard } = useClipboard();
    const { shareInsult } = useShare();
    const haptics = useHaptics();
    const { colors } = useTheme();

    const [selectedInsult, setSelectedInsult] = useState(null);
    const [listVerticalOffset, setListVerticalOffset] = useState(0);
    const [easterEgg, setEasterEgg] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchVisible, setIsSearchVisible] = useState(false);

    const seasonalIcon = useMemo(() => Utilities.getSeasonalIcon(season), [season]);

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
        if (item.insult === selectedInsult) {
            setSelectedInsult(null);
        } else {
            setSelectedInsult(item.insult);
            writeToClipboard(item.insult);
        }
    }, [selectedInsult, writeToClipboard, haptics]);

    const showEasterEgg = useCallback((item) => {
        setEasterEgg(item.url);
    }, []);

    const storeFavorite = useCallback(async (item) => {
        const success = await addFavorite(item);
        if (success) {
            haptics.success();
        }
    }, [addFavorite, haptics]);

    const renderInsult = useCallback(({ item }) => {
        return (
            <View style={ styles.insultItemContainer }>
              <PressableOpacity
                style={ null }
                onPress={ () => insultSelect(item) }
                onLongPress={ () => storeFavorite(item) }
                delayLongPress={ 500 }>
                <ScalableText style={[
                  item.insult == selectedInsult ? styles.insultSelectedText : styles.insultText,
                  { color: item.insult == selectedInsult ? colors.textSelected : colors.text }
                ]}>
                  { item.insult }
                </ScalableText>
              </PressableOpacity>
              <TouchableIcon
                visible={ item.url.length > 0 }
                iconName={ seasonalIcon }
                onPress={ () => showEasterEgg(item) }/>
            </View>
        );
    }, [selectedInsult, seasonalIcon, insultSelect, storeFavorite, showEasterEgg, colors]);

    const insultSeparator = useCallback(() => {
        return (
            <Divider width={ 1 } color={ colors.divider }/>
        );
    }, [colors]);

    const sendInsult = useCallback(() => {
        if (selectedInsult) {
            haptics.medium();
            Linking.openURL(smstag + selectedInsult);
        }
    }, [selectedInsult, smstag, haptics]);

    const handleShare = useCallback(async () => {
        if (selectedInsult) {
            haptics.medium();
            await shareInsult(selectedInsult);
        }
    }, [selectedInsult, shareInsult, haptics]);

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

    const renderListHeader = useCallback(() => {
        return (
            <>
              <InsultsHeader
                appConfig={ appConfig }
                onSearchPress={ toggleSearch }
                isSearchActive={ isSearchVisible }
              />
              <SearchBar
                isVisible={ isSearchVisible }
                searchQuery={ searchQuery }
                onSearchChange={ setSearchQuery }
                onClear={ clearSearch }
                resultCount={ filteredInsults.length }
              />
            </>
        );
    }, [appConfig, toggleSearch, isSearchVisible, searchQuery, filteredInsults.length, clearSearch]);

    return (
        <View style={ styles.insultTopView }>
          <View style={{ zIndex: 1000, elevation: 10 }}>
            <InsultsHeader
              appConfig={ appConfig }
              onSearchPress={ toggleSearch }
              isSearchActive={ isSearchVisible }
            />
            <SearchBar
              isVisible={ isSearchVisible }
              searchQuery={ searchQuery }
              onSearchChange={ setSearchQuery }
              onClear={ clearSearch }
              resultCount={ filteredInsults.length }
            />
          </View>
          <View style={ styles.insultSurfaceParent }>
            <View style={ [styles.insultSurface, { backgroundColor: colors.surface }] }>
              <View style={ styles.flatList }>
                <FlashList
                  ref={ listRef }
                  ItemSeparatorComponent={ insultSeparator }
                  onScroll={ setVerticalOffset }
                  data={ memoizedInsults }
                  keyExtractor={ extractKeys }
                  showsVerticalScrollIndicator={ true }
                  estimatedItemSize={ 40 }
                  extraData={ selectedInsult }
                  contentContainerStyle={{ paddingTop: 10 }}
                  renderItem={ renderInsult }/>
                { listVerticalOffset > listThreshold && (
                    <FloatingPressable onPress={ scrollToTop }/>
                )}
              </View>
            </View>
          </View>
          <View style={ styles.insultFooter }>
            <PressableOpacity
              style={ selectedInsult != null ? styles.insultButtons : styles.disabledInsultButtons }
              title={ 'SMS' }
              onPress={ sendInsult }
              disabled={ selectedInsult == null }>
              <Text style={ styles.insultButtonText }>SMS</Text>
            </PressableOpacity>
            <View style={ styles.spacer }/>
            <PressableOpacity
              style={ selectedInsult != null ? styles.insultButtons : styles.disabledInsultButtons }
              title={ 'Share' }
              onPress={ handleShare }
              disabled={ selectedInsult == null }>
              <Text style={ styles.insultButtonText }>Share</Text>
            </PressableOpacity>
          </View>
          { easterEgg != null ? 
            <ModalEmbeddedWebView 
              webPage={ easterEgg } 
              setDismiss={ () => setEasterEgg(null) }/> 
            : null }
        </View>
    );
}
