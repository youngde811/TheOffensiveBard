// Custom hook for sharing insults using React Native's Share API

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

import { Share, Platform, Alert } from 'react-native';
import { useCallback } from 'react';

export const useShare = () => {
  const shareText = useCallback(async (text, options = {}) => {
    if (!text) {
      console.warn('No text provided to share');
      
      return false;
    }

    try {
      const shareOptions = {
        message: text,
        ...options
      };

      // iOS supports 'url' separately, Android includes it in message
      if (Platform.OS === 'ios' && options.url) {
        shareOptions.url = options.url;
      }

      const result = await Share.share(shareOptions);

      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          // Shared with specific activity (iOS)
          console.log(`Shared via ${result.activityType}`);
        } else {
          // Shared (Android)
          console.log('Content shared successfully');
        }
        
        return true;
      } else if (result.action === Share.dismissedAction) {
        // User dismissed the share sheet
        console.log('Share cancelled');
        
        return false;
      }
    } catch (error) {
      console.error('Error sharing:', error);
      
      Alert.alert(
        'Share Failed',
        'Unable to share this content. Please try again.',
        [{ text: 'OK' }]
      );
      
      return false;
    }
  }, []);

  const shareInsult = useCallback(async (insult, includeAttribution = true) => {
    const message = includeAttribution
      ? `${insult}\n\n— Shared from The Insolent Bard`
      : insult;

    return await shareText(message, {
      title: 'Shakespearean Insult'
    });
  }, [shareText]);

  return { shareText, shareInsult };
};
