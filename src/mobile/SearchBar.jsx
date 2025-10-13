// SearchBar component for filtering insults

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

import React, { useEffect, useRef } from 'react';
import { View, TextInput, TouchableOpacity, Text, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import styles from '../styles/styles.js';

export default function SearchBar({ isVisible, searchQuery, onSearchChange, onClear, resultCount }) {
    const slideAnim = useRef(new Animated.Value(0)).current;
    const inputRef = useRef(null);

    useEffect(() => {
        Animated.timing(slideAnim, {
            toValue: isVisible ? 1 : 0,
            duration: 300,
            useNativeDriver: false,
        }).start();

        if (isVisible) {
            setTimeout(() => inputRef.current?.focus(), 300);
        }
    }, [isVisible]);

    const height = slideAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 60],
    });

    const opacity = slideAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 1],
    });

    if (!isVisible && searchQuery === '') {
        return null;
    }

    return (
        <Animated.View style={[styles.searchBarContainer, { height, opacity }]}>
            <View style={styles.searchBarContent}>
                <Ionicons name="search" size={20} color="#5f9ea0" style={styles.searchIcon} />
                <TextInput
                    ref={inputRef}
                    style={styles.searchInput}
                    placeholder="Search insults..."
                    placeholderTextColor="#999"
                    value={searchQuery}
                    onChangeText={onSearchChange}
                    autoCapitalize="none"
                    autoCorrect={false}
                    returnKeyType="search"
                />
                {searchQuery.length > 0 && (
                    <>
                        <Text style={styles.searchResultCount}>
                            {resultCount}
                        </Text>
                        <TouchableOpacity onPress={onClear} style={styles.searchClearButton}>
                            <Ionicons name="close-circle" size={20} color="#999" />
                        </TouchableOpacity>
                    </>
                )}
            </View>
        </Animated.View>
    );
}
