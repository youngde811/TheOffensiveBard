// Utility for sharing data with iOS widgets via App Groups

import { Platform } from 'react-native';
import SharedGroupPreferences from 'react-native-shared-group-preferences';

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
  } catch (error) {
    console.error('Error sharing data with widget:', error);
  }
}
