// -*- mode: rjsx; eval: (auto-fill-mode 1); -*-

// Parchment Doors - Theatrical opening animation for app launch

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

import React, { useRef } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Animated,
  Dimensions,
  Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const parchmentImage = require('../../assets/images/safwan-thottoli.jpg');

export default function ParchmentDoors({ insult, onOpen, visible }) {
  const insets = useSafeAreaInsets();
  const leftDoorAnim = useRef(new Animated.Value(0)).current;
  const rightDoorAnim = useRef(new Animated.Value(0)).current;

  const handleOpen = () => {
    // Animate both doors simultaneously
    Animated.parallel([
      Animated.timing(leftDoorAnim, {
        toValue: -SCREEN_WIDTH / 2,
        duration: 350,
        useNativeDriver: true,
      }),
      Animated.timing(rightDoorAnim, {
        toValue: SCREEN_WIDTH / 2,
        duration: 350,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Callback when animation completes
      onOpen();
    });
  };

  if (!visible) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* Left Door */}
      <Animated.View
        style={[
          styles.door,
          styles.leftDoor,
          { transform: [{ translateX: leftDoorAnim }] },
        ]}
      >
        <Image
          source={parchmentImage}
          style={styles.leftDoorImage}
          resizeMode="cover"
        />
      </Animated.View>

      {/* Right Door */}
      <Animated.View
        style={[
          styles.door,
          styles.rightDoor,
          { transform: [{ translateX: rightDoorAnim }] },
        ]}
      >
        <Image
          source={parchmentImage}
          style={styles.rightDoorImage}
          resizeMode="cover"
        />
      </Animated.View>

      {/* Content overlay (title, insult text, and latch) */}
      <View style={[styles.contentOverlay, { paddingTop: insets.top }]} pointerEvents="box-none">
        {/* App Title */}
        <View style={styles.titleContainer}>
          <Text style={styles.titleText}>The Insolent Bard</Text>
        </View>

        {/* Featured Insult */}
        <View style={styles.insultContainer}>
          <Text style={styles.insultText}>{insult}</Text>
        </View>

        {/* Latch Button */}
        <Pressable
          style={({ pressed }) => [
            styles.latchButton,
            pressed && styles.latchButtonPressed,
          ]}
          onPress={handleOpen}
        >
          <View style={styles.latchInner}>
            <MaterialCommunityIcons name="fleur-de-lis" size={22} color="#4a3728" />
          </View>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
    flexDirection: 'row',
  },
  door: {
    width: SCREEN_WIDTH / 2,
    height: SCREEN_HEIGHT,
    overflow: 'hidden',
  },
  leftDoor: {
    position: 'absolute',
    left: 0,
    top: 0,
  },
  rightDoor: {
    position: 'absolute',
    right: 0,
    top: 0,
  },
  leftDoorImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    position: 'absolute',
    left: 0,
    top: 0,
  },
  rightDoorImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  contentOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  titleContainer: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  titleText: {
    fontFamily: 'BlackChancery',
    fontSize: 32,
    color: '#4a3728',
    textAlign: 'center',
    textShadowColor: 'rgba(255, 255, 255, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  insultContainer: {
    marginTop: '25%',
    paddingHorizontal: 30,
  },
  insultText: {
    fontFamily: 'BlackChancery',
    fontSize: 26,
    color: '#4a3728',
    textAlign: 'center',
    lineHeight: 36,
    textShadowColor: 'rgba(255, 255, 255, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  latchButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#c9a227',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
    borderWidth: 3,
    borderColor: '#a67c00',
  },
  latchButtonPressed: {
    backgroundColor: '#a67c00',
    transform: [{ scale: 0.95 }],
  },
  latchInner: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#d4af37',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#c9a227',
  },
});
