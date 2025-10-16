// -*- mode: rjsx; eval: (auto-fill-mode 1); -*-

// This component renders the insult page itself.

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
import { ActivityIndicator, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';

import InsultEmAll from './InsultEmAll';

import * as SplashScreen from 'expo-splash-screen';

import styles from '../styles/styles.js';
import { useTheme } from '../contexts/ThemeContext';

const allInsults = require('../../assets/data/insults-10k.json');

const SAMPLE_SIZE = 1000;

// Fisher-Yates shuffle algorithm
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// Get random sample of insults
function getRandomSample(source, sampleSize) {
    const shuffled = shuffleArray(source);
    return shuffled.slice(0, sampleSize);
}

SplashScreen.preventAutoHideAsync();

export default function TheOffensiveBardInsults({ appConfig }) {
    const { colors, isDark } = useTheme();
    const [insultData, setInsultData] = useState([]);
    const [appIsReady, setAppIsReady] = useState(false);

    const [fontsLoaded] = useFonts({
        'Inter-Black': require('../../assets/fonts/Inter-Black.otf')
    });

    // Load random sample on mount
    useEffect(() => {
        async function prepare() {
            const sample = getRandomSample(allInsults.insults, SAMPLE_SIZE);
            setInsultData(sample);
        }

        prepare();
    }, []);

    // Refresh with new random sample
    const refreshInsults = useCallback(() => {
        const sample = getRandomSample(allInsults.insults, SAMPLE_SIZE);
        setInsultData(sample);
    }, []);

    const onLayoutRootView = useCallback(async () => {
        if (fontsLoaded) {
            await SplashScreen.hideAsync();
            setAppIsReady(true);
        }
    }, [fontsLoaded]);

    if (!fontsLoaded) {
        return null;
    }

    return (
        <View style={[styles.backgroundImage, { backgroundColor: colors.background }]}>
          <SafeAreaView style={ styles.appTopView } onLayout={ onLayoutRootView }>
            <StatusBar style={isDark ? "light" : "dark"}/>
            { !appIsReady && <ActivityIndicator animating={ true } size='large' color={colors.primary}/> }
            { insultData.length > 0 ?
              <InsultEmAll
                insults={ insultData }
                appConfig={ appConfig }
                onRefresh={ refreshInsults }
              />
              :
              null }
          </SafeAreaView>
        </View>
    );
}
