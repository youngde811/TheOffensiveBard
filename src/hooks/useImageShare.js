// Custom hook for generating and sharing insult images

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

import { useRef, useState } from 'react';
import { Alert } from 'react-native';
import * as Sharing from 'expo-sharing';
import { captureRef } from 'react-native-view-shot';

export function useImageShare() {
  const [isGenerating, setIsGenerating] = useState(false);
  const imageRef = useRef(null);

  const shareAsImage = async (insultText) => {
    if (!insultText || isGenerating) {
      return;
    }

    setIsGenerating(true);

    try {
      // Wait a moment for the view to render
      await new Promise(resolve => setTimeout(resolve, 100));

      // Capture the view as an image
      const uri = await captureRef(imageRef, {
        format: 'png',
        quality: 1.0,
      });

      // Check if sharing is available
      const isSharingAvailable = await Sharing.isAvailableAsync();

      if (!isSharingAvailable) {
        Alert.alert('Error', 'Sharing is not available on this device');
        setIsGenerating(false);
        return;
      }

      // Share the image
      await Sharing.shareAsync(uri, {
        mimeType: 'image/png',
        dialogTitle: 'Share this insult',
      });

      setIsGenerating(false);
    } catch (error) {
      console.error('Error sharing image:', error);
      Alert.alert('Error', 'Failed to share image. Please try again.');
      setIsGenerating(false);
    }
  };

  return {
    imageRef,
    isGenerating,
    shareAsImage,
  };
}
