// -*- mode: rjsx; eval: (auto-fill-mode 1); -*-

// This file contains the entry point for our TheOffensiveBard app.

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

import 'react-native-gesture-handler';

import React from 'react';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';

import { AppProvider } from './src/contexts/AppContext';
import { ThemeProvider, useTheme } from './src/contexts/ThemeContext';
import { SettingsProvider } from './src/contexts/SettingsContext';

import { Alert } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Keep the splash screen visible while we load fonts
SplashScreen.preventAutoHideAsync();

import { createDrawerNavigator } from '@react-navigation/drawer';
import { useNavigation, NavigationContainer } from '@react-navigation/native';

import { Entypo } from '@expo/vector-icons';

import { setJSExceptionHandler, setNativeExceptionHandler } from 'react-native-exception-handler';
import RNRestart from 'react-native-restart';

import InsultPage from './src/mobile/InsultPage';
import FavoriteInsults from './src/mobile/FavoriteInsults';
import Settings from './src/mobile/Settings';
import EmbeddedWebView from './src/mobile/EmbeddedWebView';
import ErrorBoundary from './src/components/ErrorBoundary';

const appConfig = require("./assets/appconfig.json");

const initialRoute = "The Insolent Bard";

function InsultsMainPage() {
  return (
    <InsultPage appConfig={appConfig} />
  );
}

function FavoritesMainPage() {
  const navigation = useNavigation();

  return (
    <FavoriteInsults appConfig={appConfig} setDismiss={() => navigation.jumpTo(initialRoute)} />
  );
}

function SettingsMainPage() {
  const navigation = useNavigation();

  return (
    <Settings appConfig={appConfig} setDismiss={() => navigation.jumpTo(initialRoute)} />
  );
}

function AboutMainPage() {
  const navigation = useNavigation();

  return (
    <EmbeddedWebView webPage={appConfig.aboutPage} setDismiss={() => navigation.jumpTo(initialRoute)} />
  );
}

const Drawer = createDrawerNavigator();

function ThemedDrawerNavigator() {
  const { colors } = useTheme();

  const screens = [
  {
    key: "AvailableInsults",
    title: initialRoute,
    iconName: "list",
    component: InsultsMainPage,
  },
  {
    key: "FavoritesMainPage",
    title: "Favorite Insults",
    iconName: "heart-outlined",
    component: FavoritesMainPage
  },
  {
    key: "SettingsMainPage",
    title: "Settings",
    iconName: "cog",
    component: SettingsMainPage
  },
  {
    key: "AboutMainPage",
    title: "About the App",
    iconName: "info",
    component: AboutMainPage
  },
];

  return (
    <Drawer.Navigator
      initialRouteName={initialRoute}
      backBehavior="history"
      screenOptions={{
        headerShown: true,
        unmountOnBlur: true,
        drawerType: "slide",
        itemStyle: { marginVertical: 10 },
        drawerStyle: {
          backgroundColor: colors.drawerBackground
        },
        drawerActiveTintColor: colors.primary,
        drawerInactiveTintColor: colors.text,
        drawerLabelStyle: {
          color: colors.text,
        },
        swipeEnabled: true,
        swipeEdgeWidth: 50,
        headerStyle: {
          backgroundColor: colors.headerBackground,
        },
        headerTintColor: colors.text,
      }}
    >
      {screens.map(drawer =>
        <Drawer.Screen
          key={drawer.key}
          name={drawer.title}
          component={drawer.component}
          options={{
            drawerIcon: ({ focused, color }) => (
              <Entypo name={drawer.iconName} size={24} color={focused ? colors.primary : colors.text} />
            ),
          }}
        />
      )}
    </Drawer.Navigator>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({
    'BlackChancery': require('./assets/fonts/blkchcry.ttf'),
  });

  React.useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  const masterErrorHandler = (e, isFatal) => {
    if (isFatal) {
      Alert.alert(
        'Unexpected exception occurred',
        `
                Error: ${(isFatal) ? 'Fatal: ' : ''} ${e.name} ${e.message}

                Please restart your TheOffensiveBard app!
                `,
        [{ text: 'Restart', onPress: () => { RNRestart.Restart(); } }]
      );
    } else {
      // Show user feedback for non-fatal errors
      console.log('TheOffensiveBard: exception: ' + e);
      Alert.alert(
        'Error',
        `An error occurred: ${e.message}\n\nThe app will continue to function, but some features may not work as expected.`,
        [{ text: 'OK' }]
      );
    }
  };

  // Handle unhandled promise rejections
  const promiseRejectionHandler = (reason, promise) => {
    console.error('Unhandled Promise Rejection:', reason);
    Alert.alert(
      'Error',
      `An unexpected error occurred: ${reason}\n\nPlease try again or restart the app if the problem persists.`,
      [
        { text: 'OK' },
        { text: 'Restart', onPress: () => { RNRestart.Restart(); } }
      ]
    );
  };

  setJSExceptionHandler(masterErrorHandler);

  // Set up promise rejection tracking
  if (typeof global.Promise !== 'undefined') {
    global.Promise.prototype._rejectionHandler = promiseRejectionHandler;
  }

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <SettingsProvider>
          <AppProvider>
            <SafeAreaProvider>
              <NavigationContainer>
                <ThemedDrawerNavigator />
              </NavigationContainer>
            </SafeAreaProvider>
          </AppProvider>
        </SettingsProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
