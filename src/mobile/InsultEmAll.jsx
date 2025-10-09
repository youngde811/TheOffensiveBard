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

import { Animated, Text, View } from 'react-native';
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

import { useAppContext } from '../contexts/AppContext';
import { useFavorites } from '../hooks/useFavorites';
import { useClipboard } from '../hooks/useClipboard';

import * as Utilities from '../utils/utilities';

export default function InsultEmAll({ insults, appConfig }) {
    const { season, smstag } = useAppContext();
    const { addFavorite } = useFavorites();
    const { writeToClipboard } = useClipboard();
    
    const [selectedInsult, setSelectedInsult] = useState(null);
    const [favoriteAdded, setFavoriteAdded] = useState(false);
    const [listVerticalOffset, setListVerticalOffset] = useState(0);
    const [easterEgg, setEasterEgg] = useState(null);

    const seasonalIcon = useMemo(() => Utilities.getSeasonalIcon(season), [season]);
    const memoizedInsults = useMemo(() => insults, [insults]);

    const listThreshold = 300;
    const animation = useRef(new Animated.Value(0)).current;
    const listRef = useRef(null);

    const insultSelect = useCallback((item) => {
        if (item.insult === selectedInsult) {
            setSelectedInsult(null);
        } else {
            setSelectedInsult(item.insult);
            writeToClipboard(item.insult);
        }
    }, [selectedInsult, writeToClipboard]);

    const showEasterEgg = useCallback((item) => {
        setEasterEgg(item.url);
    }, []);

    const storeFavorite = useCallback(async (item) => {
        const success = await addFavorite(item);
        if (success) {
            setFavoriteAdded(true);
        }
    }, [addFavorite]);

    const renderInsult = useCallback(({ item }) => {
        return (
            <View style={ styles.insultItemContainer }>
              <PressableOpacity 
                style={ null } 
                onPress={ () => insultSelect(item) }
                onLongPress={ () => storeFavorite(item) } 
                delayLongPress={ 500 }>
                <ScalableText style={ item.insult == selectedInsult ? styles.insultSelectedText : styles.insultText }>
                  { item.insult }
                </ScalableText>
              </PressableOpacity>
              <TouchableIcon 
                visible={ item.url.length > 0 } 
                iconName={ seasonalIcon } 
                onPress={ () => showEasterEgg(item) }/>
            </View>
        );
    }, [selectedInsult, seasonalIcon, insultSelect, storeFavorite, showEasterEgg]);

    const insultSeparator = useCallback(() => {
        return (
            <Divider width={ 1 } color={ "cornsilk" }/>
        );
    }, []);

    const sendInsult = useCallback(() => {
        if (selectedInsult) {
            Linking.openURL(smstag + selectedInsult);
        }
    }, [selectedInsult, smstag]);

    const animateFavoriteAdded = useCallback(() => {
        Animated.timing(animation, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true
        }).start((state) => { setFavoriteAdded(false); });
    }, [animation]);

    const notifyFavoriteAdded = useCallback(() => {
        animateFavoriteAdded();

        return (
            <Animated.Text style={{ opacity: animation, fontSize: 12, color: 'maroon', marginTop: 4 }}>
              Favorite added!
            </Animated.Text>
        );
    }, [animateFavoriteAdded, animation]);

    const scrollToTop = useCallback(() => {
        listRef.current?.scrollToOffset({ offset: 0, animated: true });
    }, []);

    const extractKeys = useCallback((item) => {
        return item.id;
    }, []);

    const setVerticalOffset = useCallback((event) => {
        setListVerticalOffset(event.nativeEvent.contentOffset.y);
    }, []);
    
    return (
        <View style={ styles.insultTopView }>
          <View style={ styles.insultSurfaceParent }>
            { favoriteAdded && notifyFavoriteAdded() }
            <Surface elevation={ 4 } style={ styles.insultSurface }>
              <View style={ styles.flatList }>
                <FlashList
                  ref={ listRef }
                  ItemSeparatorComponent={ insultSeparator }
                  onScroll={ setVerticalOffset }
                  data={ memoizedInsults }
                  keyExtractor={ extractKeys }
                  showsVerticalScrollIndicator={ true }
                  estimatedItemSize={ 100 }
                  extraData={ selectedInsult }
                  renderItem={ renderInsult }/>
                { listVerticalOffset > listThreshold && (
                    <FloatingPressable onPress={ scrollToTop }/>
                )}
              </View>
            </Surface>
          </View>
          <View style={ styles.insultFooter }>
            <PressableOpacity 
              style={ selectedInsult != null ? styles.insultButtons : styles.disabledInsultButtons }
              title={ 'Insult' } 
              onPress={ sendInsult } 
              disabled={ selectedInsult == null }>
              <Text style={ styles.insultButtonText }>Insult</Text>
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
