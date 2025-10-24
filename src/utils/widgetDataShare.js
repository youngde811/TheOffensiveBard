// Utility for sharing data with iOS widgets via App Groups.

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

import { Platform } from 'react-native';
import SharedGroupPreferences from 'react-native-shared-group-preferences';
import WidgetKit from 'react-native-widgetkit';

const APP_GROUP = 'group.com.bosshog811.TheInsolentBard';
const WIDGET_DATA_KEY = 'currentInsult';

/**
 * Share current insult with iOS widget
 * @param {string} insultText - The insult text to share
 */
export async function shareInsultWithWidget(insultText) {
  if (Platform.OS !== 'ios') {
    return;
  }

  try {
    const data = {
      insult: insultText,
      timestamp: new Date().toISOString(),
    };

    await SharedGroupPreferences.setItem(
      WIDGET_DATA_KEY,
      JSON.stringify(data),
      APP_GROUP
    );

    console.log('Shared insult with widget:', insultText);

    // Force widget to reload
    try {
      WidgetKit.reloadAllTimelines();
      
      console.log('Widget reloaded');
    } catch (reloadError) {
      console.log('Widget reload not available:', reloadError.message);
    }
  } catch (error) {
    console.error('Error sharing data with widget:', error);
  }
}
