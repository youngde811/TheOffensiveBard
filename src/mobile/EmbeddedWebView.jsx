// -*- mode: rjsx; eval: (auto-fill-mode 1); -*-

// This component offers a modal embeddable web page viewer. We'll use it to show a screen
// linked to Lord Buckley's WikiPedia page.

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

import React, { useState, useEffect } from 'react';

import { StatusBar } from 'expo-status-bar';
import { Text, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ActivityIndicator } from 'react-native';
import { Asset } from 'expo-asset';

import PressableOpacity from './PressableOpacity';
import { useTheme } from '../contexts/ThemeContext';

import styles from '../styles/styles.js';

function LoadingIndicator({ colors }) {
  return (
    <ActivityIndicator color={colors.primary} size='large' />
  );
}

export default function EmbeddedWebView({ webPage, setDismiss }) {
  const { colors, isDark } = useTheme();
  const [htmlContent, setHtmlContent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadContent() {
      // Check if it's a local file path
      if (webPage.startsWith('./assets/')) {
        try {
          const htmlFile = require('../../assets/about.html');
          const asset = Asset.fromModule(htmlFile);

          await asset.downloadAsync();

          const response = await fetch(asset.localUri || asset.uri);

          let html = await response.text();

          // Inject theme-aware CSS
          const themeStyles = `
                        <style>
                            body {
                                background-color: ${colors.background} !important;
                                color: ${colors.text} !important;
                            }
                            a {
                                color: ${colors.primary} !important;
                            }
                            h1, h2, h3, h4, h5, h6 {
                                color: ${colors.text} !important;
                                border-color: ${colors.primary} !important;
                            }
                            p, li, span, div, strong {
                                color: ${colors.text} !important;
                            }
                            .section {
                                background-color: ${colors.surface} !important;
                                box-shadow: 0 2px 4px rgba(0,0,0,${isDark ? '0.3' : '0.1'}) !important;
                            }
                            .highlight {
                                background-color: ${colors.surfaceSecondary} !important;
                                border-left-color: ${colors.primary} !important;
                            }
                            .version, .license, .author {
                                color: ${colors.textSecondary} !important;
                            }
                            .license {
                                border-top-color: ${colors.divider} !important;
                            }
                        </style>
                    `;

          // Inject styles before closing </head> tag or at the beginning if no head tag
          if (html.includes('</head>')) {
            html = html.replace('</head>', `${themeStyles}</head>`);
          } else if (html.includes('<head>')) {
            html = html.replace('<head>', `<head>${themeStyles}`);
          } else {
            html = themeStyles + html;
          }

          setHtmlContent(html);
        } catch (error) {
          console.error('Error loading local HTML:', error);
        }
      }
      setIsLoading(false);
    }
    loadContent();
  }, [webPage, colors, isDark]);

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.webViewTop, { backgroundColor: colors.background }]}>
        <LoadingIndicator colors={colors} />
      </SafeAreaView>
    );
  }

  // Determine the source for WebView
  const webViewSource = htmlContent
    ? { html: htmlContent }
    : { uri: webPage };

  const originWhitelist = htmlContent
    ? ['*']
    : ['https://*'];

  return (
    <SafeAreaView style={[styles.webViewTop, { backgroundColor: colors.background }]}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <WebView
        style={[styles.webView, { backgroundColor: colors.background }]}
        originWhitelist={originWhitelist}
        source={webViewSource}
        startInLoadingState={true}
        renderLoading={() => <LoadingIndicator colors={colors} />}
        allowsBackForwardNavigationGestures={true}
        decelerationRate={'normal'} />
      <View style={[styles.webFooter, { backgroundColor: colors.surface }]}>
        <PressableOpacity style={styles.webButtons} title={'Dismiss'} onPress={setDismiss}>
          <Text style={styles.webText}>Dismiss</Text>
        </PressableOpacity>
      </View>
    </SafeAreaView>
  );
};
