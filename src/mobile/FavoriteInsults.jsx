// -*- mode: rjsx; eval: (auto-fill-mode 1); -*-

// This component is used to render the "favorite insults" page. Refactored to use
// modern React patterns with custom hooks and context.

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
import { ActivityIndicator, Text, View, TouchableOpacity } from 'react-native';
import { Divider } from "@rneui/themed";
import { SafeAreaView } from 'react-native-safe-area-context';
import { FlashList } from "@shopify/flash-list";
import { Ionicons } from '@expo/vector-icons';

import ScalableText from 'react-native-text';

import * as Linking from 'expo-linking';

import styles from '../styles/styles.js';
import PressableOpacity from './PressableOpacity';
import NoFavorites from './NoFavorites';
import InsultsHeader from './InsultsHeader';
import InsultImageTemplate from '../components/InsultImageTemplate';

import { useAppContext } from '../contexts/AppContext';
import { useClipboard } from '../hooks/useClipboard';
import { useShare } from '../hooks/useShare';
import { useHaptics } from '../hooks/useHaptics';
import { useTheme } from '../contexts/ThemeContext';
import { useInsultOfTheHour } from '../hooks/useInsultOfTheHour';
import { useImageShare } from '../hooks/useImageShare';

export default function FavoriteInsults({ appConfig, setDismiss }) {
    const { colors } = useTheme();
    const { smstag, favorites, isLoadingFavorites, fetchFavorites, removeFavorite } = useAppContext();
    const { writeToClipboard } = useClipboard();
    const { shareInsult } = useShare();

    const haptics = useHaptics();
    const { currentInsult: insultOfTheHour, isRefreshing } = useInsultOfTheHour(favorites);
    const { imageRef, isGenerating, shareAsImage } = useImageShare();

    const [selectedInsults, setSelectedInsults] = useState([]);
    const [insultToShare, setInsultToShare] = useState(null);

    const insultSelect = useCallback((item) => {
        haptics.selection();

        const isSelected = selectedInsults.some(selected => selected.id === item.id);

        if (isSelected) {
            // Remove from selection
            setSelectedInsults(selectedInsults.filter(selected => selected.id !== item.id));
        } else {
            // Add to selection
            const newSelection = [...selectedInsults, item];
          
            setSelectedInsults(newSelection);

            // Copy all selected insults to clipboard
            const insultTexts = newSelection.map(i => i.insult).join('\n');
            writeToClipboard(insultTexts);
        }
    }, [selectedInsults, writeToClipboard, haptics]);

    const renderInsult = useCallback(({item}) => {
        const isSelected = selectedInsults.some(selected => selected.id === item.id);

        return (
            <View style={styles.insultItemContainer}>
              <PressableOpacity style={null} onPress={() => insultSelect(item)}>
                <ScalableText style={[
                  isSelected ? styles.insultSelectedText : styles.insultText,
                  { color: isSelected ? colors.textSelected : colors.text }
                ]}>
                  {item.insult}
                </ScalableText>
              </PressableOpacity>
            </View>
        );
    }, [selectedInsults, insultSelect, colors]);

    const favoritesSeparator = useCallback(() => {
        return (
            <Divider width={1} color={colors.divider}/>
        );
    }, [colors]);

    const sendInsult = useCallback(() => {
        if (selectedInsults.length > 0) {
            haptics.medium();
          
            const combinedInsults = selectedInsults.map(item => item.insult).join('\n');
            Linking.openURL(smstag + combinedInsults);
        }
    }, [selectedInsults, smstag, haptics]);

    const forgetFavorite = useCallback(async () => {
        if (selectedInsults.length > 0) {
            haptics.light();

            // Remove all selected favorites
            for (const item of selectedInsults) {
                await removeFavorite(item);
            }

            setSelectedInsults([]);
        }
    }, [selectedInsults, removeFavorite, haptics]);

    const handleShare = useCallback(async () => {
        if (selectedInsults.length > 0) {
            haptics.medium();

            const combinedInsults = selectedInsults.map(item => item.insult).join('\n');
            await shareInsult(combinedInsults);
        }
    }, [selectedInsults, shareInsult, haptics]);

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
              ItemSeparatorComponent={ favoritesSeparator }
              data={ favorites }
              keyExtractor={ (item) => item.id }
              extraData={ selectedInsults }
              estimatedItemSize={ 100 }
              renderItem={ renderInsult }/>
        );
    };

    return (
        <View style={[styles.backgroundImage, { backgroundColor: colors.background }]}>
          <SafeAreaView style={ styles.favoritesTopView }>
            <StatusBar style="auto"/>
            <View style={{ zIndex: 1000, elevation: 10 }}>
              <InsultsHeader
                appConfig={appConfig}
                insultOfTheHour={insultOfTheHour}
                isRefreshing={isRefreshing}
                onInsultPress={handleInsultOfTheHourPress}
              />
            </View>
            { favorites.length === 0 && !isLoadingFavorites ?
              <NoFavorites/>
              :
              <View style={ styles.favoritesSurface }>
                <View style={{ flex: 1, backgroundColor: colors.surface, borderRadius: 16, padding: 0, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84, elevation: 4 }}>
                  <View style={ styles.favoritesListView }>
                    { renderFavorites() }
                  </View>
                </View>
              </View>
            }
            <View style={ styles.favoritesFooter }>
              <PressableOpacity
                style={ selectedInsults.length > 0 ? styles.favoritesButtons : styles.disabledFavoritesButtons }
                title={ 'SMS' }
                onPress={ sendInsult }
                disabled={ selectedInsults.length === 0 }>
                <Text style={ styles.favoritesButtonText }>SMS</Text>
              </PressableOpacity>
              <View style={ styles.spacer }/>
              <PressableOpacity
                style={ selectedInsults.length > 0 ? styles.favoritesButtons : styles.disabledFavoritesButtons }
                title={ 'Share' }
                onPress={ handleShare }
                disabled={ selectedInsults.length === 0 }>
                <Text style={ styles.favoritesButtonText }>Share</Text>
              </PressableOpacity>
              <View style={ styles.spacer }/>
              <PressableOpacity
                style={ selectedInsults.length > 0 ? styles.favoritesButtons : styles.disabledFavoritesButtons }
                title={ 'Forget' }
                onPress={ forgetFavorite }
                disabled={ selectedInsults.length === 0 }>
                <Text style={ styles.favoritesButtonText }>Forget</Text>
              </PressableOpacity>
              <View style={ styles.spacer }/>
              <PressableOpacity
                style={ styles.favoritesButtons }
                title={ 'Dismiss' }
                onPress={ setDismiss }>
                <Text style={ styles.favoritesButtonText }>Dismiss</Text>
              </PressableOpacity>
            </View>
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
