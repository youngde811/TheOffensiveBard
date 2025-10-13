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

const insults = require('../../assets/data/insults.json');

SplashScreen.preventAutoHideAsync();

export default function TheOffensiveBardInsults({ appConfig }) {
    const { colors, isDark } = useTheme();
    const [insultData, setInsultData] = useState([]);
    const [appIsReady, setAppIsReady] = useState(false);

    const [fontsLoaded] = useFonts({
        'Inter-Black': require('../../assets/fonts/Inter-Black.otf')
    });

    useEffect(() => {
        async function prepare() {
            setInsultData(insults.insults);
        }

        prepare();
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
              <InsultEmAll insults={ insultData } appConfig={ appConfig }/>
              :
              null }
          </SafeAreaView>
        </View>
    );
}
