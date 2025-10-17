// Component for rendering insults as shareable images with parchment styling

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
import { View, Text, StyleSheet } from 'react-native';

export default function InsultImageTemplate({ insultText }) {
  return (
    <View style={styles.container}>
      <View style={styles.parchment}>
        <Text style={styles.insultText}>{insultText}</Text>
        <Text style={styles.attribution}>— The Insolent Bard</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 800,
    height: 600,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2c1810',
  },
  parchment: {
    width: 700,
    height: 500,
    backgroundColor: '#f4e8d0',
    borderRadius: 8,
    borderWidth: 3,
    borderColor: '#8b7355',
    padding: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
  },
  insultText: {
    fontFamily: 'BlackChancery',
    fontSize: 48,
    color: '#2c1810',
    textAlign: 'center',
    lineHeight: 64,
    marginBottom: 40,
  },
  attribution: {
    fontFamily: 'BlackChancery',
    fontSize: 28,
    color: '#5d4e37',
    fontStyle: 'italic',
    marginTop: 20,
  },
});
