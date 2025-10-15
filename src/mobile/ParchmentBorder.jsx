// -*- mode: rjsx; eval: (auto-fill-mode 1); -*-

// This component provides a subtle weathered parchment edge effect using shadows and gradients.

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

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

export default function ParchmentBorder({ children, style }) {
    const { colors, isDark } = useTheme();

    return (
        <View style={[styles.container, style]}>
            {/* Top edge */}
            <View style={[
                styles.edge,
                styles.edgeTop,
                {
                    shadowColor: isDark ? '#000' : '#8B7355',
                    backgroundColor: colors.surface,
                }
            ]} />

            {/* Bottom edge */}
            <View style={[
                styles.edge,
                styles.edgeBottom,
                {
                    shadowColor: isDark ? '#000' : '#8B7355',
                    backgroundColor: colors.surface,
                }
            ]} />

            {/* Left edge */}
            <View style={[
                styles.edge,
                styles.edgeLeft,
                {
                    shadowColor: isDark ? '#000' : '#8B7355',
                    backgroundColor: colors.surface,
                }
            ]} />

            {/* Right edge */}
            <View style={[
                styles.edge,
                styles.edgeRight,
                {
                    shadowColor: isDark ? '#000' : '#8B7355',
                    backgroundColor: colors.surface,
                }
            ]} />

            {/* Content */}
            <View style={styles.content}>
                {children}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'relative',
        flex: 1,
    },
    content: {
        flex: 1,
    },
    edge: {
        position: 'absolute',
        zIndex: 10,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
    },
    edgeTop: {
        top: 0,
        left: 0,
        right: 0,
        height: 3,
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
    },
    edgeBottom: {
        bottom: 0,
        left: 0,
        right: 0,
        height: 3,
        borderBottomLeftRadius: 16,
        borderBottomRightRadius: 16,
    },
    edgeLeft: {
        top: 0,
        left: 0,
        bottom: 0,
        width: 3,
        borderTopLeftRadius: 16,
        borderBottomLeftRadius: 16,
    },
    edgeRight: {
        top: 0,
        right: 0,
        bottom: 0,
        width: 3,
        borderTopRightRadius: 16,
        borderBottomRightRadius: 16,
    },
});
