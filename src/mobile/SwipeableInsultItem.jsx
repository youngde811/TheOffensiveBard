// Swipeable insult item component with gesture handling

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
import { View, StyleSheet, Animated } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';

import PressableOpacity from './PressableOpacity';
import TouchableIcon from './TouchableIcon';
import ScalableText from 'react-native-text';
import styles from '../styles/styles.js';

export default function SwipeableInsultItem({
  item,
  index,
  isSelected,
  hasEgg,
  seasonalIcon,
  onPress,
  onLongPress,
  onFavorite,
  onShare,
  onEggPress,
  onEggLongPress,
  colors,
  favoriteIcon = 'heart',
  favoriteColor = '#e74c3c',
}) {
  const swipeableRef = useRef(null);

  const renderRightActions = (_progress, _dragX) => {
    return (
      <View style={swipeStyles.rightActionsContainer}>
        <Animated.View style={swipeStyles.actionButton}>
          <PressableOpacity
            style={[swipeStyles.actionButtonInner, { backgroundColor: favoriteColor }]}
            onPress={() => {
              swipeableRef.current?.close();
              onFavorite();
            }}
          >
            <Ionicons name={favoriteIcon} size={24} color="white" />
          </PressableOpacity>
        </Animated.View>
        <Animated.View style={swipeStyles.actionButton}>
          <PressableOpacity
            style={[swipeStyles.actionButtonInner, { backgroundColor: '#3498db' }]}
            onPress={() => {
              swipeableRef.current?.close();
              onShare();
            }}
          >
            <Ionicons name="share-outline" size={24} color="white" />
          </PressableOpacity>
        </Animated.View>
      </View>
    );
  };

  return (
    <Swipeable
      ref={swipeableRef}
      renderRightActions={renderRightActions}
      overshootRight={false}
      friction={2}
    >
      <View style={[styles.insultItemContainer, { backgroundColor: colors.surface }]}>
        <PressableOpacity
          style={{ flex: 1 }}
          onPress={onPress}
          onLongPress={onLongPress}
          delayLongPress={500}
        >
          <ScalableText
            style={[
              isSelected ? styles.insultSelectedText : styles.insultText,
              { color: isSelected ? colors.textSelected : colors.text }
            ]}
          >
            {item.insult}
          </ScalableText>
        </PressableOpacity>
        <TouchableIcon
          visible={hasEgg}
          iconName={seasonalIcon}
          onPress={onEggPress}
          onLongPress={onEggLongPress}
        />
      </View>
    </Swipeable>
  );
}

const swipeStyles = StyleSheet.create({
  rightActionsContainer: {
    flexDirection: 'row',
    marginVertical: 4,
    marginRight: 8,
  },
  actionButton: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonInner: {
    width: 64,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginLeft: 8,
  },
});
