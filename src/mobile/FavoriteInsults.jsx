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
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { Divider } from "@rneui/themed";
import { Surface } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FlashList } from "@shopify/flash-list";

import ScalableText from 'react-native-text';

import * as Linking from 'expo-linking';

import styles from '../styles/styles.js';
import PressableOpacity from './PressableOpacity';
import NoFavorites from './NoFavorites';
import InsultsHeader from './InsultsHeader';

import { useAppContext } from '../contexts/AppContext';
import { useClipboard } from '../hooks/useClipboard';
import { useShare } from '../hooks/useShare';
import { useHaptics } from '../hooks/useHaptics';

export default function FavoriteInsults({ appConfig, backgroundColor, setDismiss }) {
    const { smstag, favorites, isLoadingFavorites, fetchFavorites, removeFavorite } = useAppContext();
    const { writeToClipboard } = useClipboard();
    const { shareInsult } = useShare();
    const haptics = useHaptics();

    const [selectedInsult, setSelectedInsult] = useState(null);

    const insultSelect = useCallback((item) => {
        haptics.selection();
        if (item.insult === selectedInsult?.insult) {
            setSelectedInsult(null);
        } else {
            setSelectedInsult(item);
            writeToClipboard(item.insult);
        }
    }, [selectedInsult, writeToClipboard, haptics]);

    const renderInsult = useCallback(({item}) => {
        return (
            <View style={ styles.insultItemContainer }>
              <PressableOpacity style={ null } onPress={ () => insultSelect(item) }>
                <ScalableText style={ item === selectedInsult ? styles.insultSelectedText : styles.insultText }>
                  { item.insult }
                </ScalableText>
              </PressableOpacity>
            </View>
        );
    }, [selectedInsult, insultSelect]);

    const favoritesSeparator = useCallback(() => {
        return (
            <Divider width={1} color={"cornsilk"}/>
        );
    }, []);

    const sendInsult = useCallback(() => {
        if (selectedInsult) {
            haptics.medium();
            Linking.openURL(smstag + selectedInsult.insult);
        }
    }, [selectedInsult, smstag, haptics]);

    const forgetFavorite = useCallback(async () => {
        if (selectedInsult) {
            haptics.light();
            const success = await removeFavorite(selectedInsult);
            if (success) {
                setSelectedInsult(null);
            }
        }
    }, [selectedInsult, removeFavorite, haptics]);

    const handleShare = useCallback(async () => {
        if (selectedInsult) {
            haptics.medium();
            await shareInsult(selectedInsult.insult);
        }
    }, [selectedInsult, shareInsult, haptics]);

    useEffect(() => {
        fetchFavorites();
    }, [fetchFavorites]);

    const renderFavorites = () => {
        if (isLoadingFavorites) {
            return (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color="#3b63b3" />
                    <Text style={{ marginTop: 10, color: 'gray' }}>Loading favorites...</Text>
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
              extraData={ selectedInsult }
              estimatedItemSize={ 100 }
              renderItem={ renderInsult }/>
        );
    };

    return (
        <View style={[styles.backgroundImage, { backgroundColor }]}>
          <SafeAreaView style={ styles.favoritesTopView }>
            <StatusBar style="auto"/>
            { !isLoadingFavorites && favorites.length === 0 && <ActivityIndicator animating={ true } size='large' color='#3b63b3'/> }
            <View style={{ zIndex: 1000, elevation: 10 }}>
              <InsultsHeader appConfig={ appConfig }/>
            </View>
            { favorites.length === 0 && !isLoadingFavorites ?
              <NoFavorites/>
              :
              <View style={ [styles.favoritesSurface, { flex: 1, backgroundColor: 'white', borderRadius: 10, padding: 0, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84, elevation: 4 }] }>
                <View style={ styles.favoritesListView }>
                  { renderFavorites() }
                </View>
              </View>
            }
            <View style={ styles.favoritesFooter }>
              <PressableOpacity
                style={ selectedInsult != null ? styles.favoritesButtons : styles.disabledFavoritesButtons }
                title={ 'SMS' }
                onPress={ sendInsult }
                disabled={ selectedInsult == null }>
                <Text style={ styles.favoritesButtonText }>SMS</Text>
              </PressableOpacity>
              <View style={ styles.spacer }/>
              <PressableOpacity
                style={ selectedInsult != null ? styles.favoritesButtons : styles.disabledFavoritesButtons }
                title={ 'Share' }
                onPress={ handleShare }
                disabled={ selectedInsult == null }>
                <Text style={ styles.favoritesButtonText }>Share</Text>
              </PressableOpacity>
              <View style={ styles.spacer }/>
              <PressableOpacity
                style={ selectedInsult ? styles.favoritesButtons : styles.disabledFavoritesButtons }
                title={ 'Forget' }
                onPress={ forgetFavorite }
                disabled={ selectedInsult == null }>
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
        </View>
    );
}
