// -*- mode: rjsx; eval: (auto-fill-mode 1); -*-

// This component is used to render a View and Text whenever there are no favorites saved.

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

import { View } from 'react-native';

import ScalableText from 'react-native-text';

import styles from '../styles/styles.js';
import { useTheme } from '../contexts/ThemeContext';

export default function NoFavorites() {
    const { colors } = useTheme();

    return (
        <View style={ styles.noFavoritesView }>
          <ScalableText style={ [styles.noFavoritesText, { color: colors.textSecondary, marginTop: 20 }] }>
            You have created no favorites yet.
          </ScalableText>
          <ScalableText style={ [styles.noFavoritesText, { color: colors.textSecondary }] }>
            Find the secret to adding them!
          </ScalableText>
        </View>
    );
};
