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
const INSULT_DATABASE_KEY = 'insultDatabase';
const DATABASE_VERSION_KEY = 'insultDatabaseVersion';
const CURRENT_DATABASE_VERSION = '1.0'; // Increment when insults.json changes

/**
 * Sync full insult database to App Group UserDefaults for autonomous widget operation
 * This allows the widget to generate its own timeline without app intervention
 * @param {Array} insults - Array of all insult objects from insults-10k.json
 */
export async function syncInsultDatabaseWithWidget(insults) {
  if (Platform.OS !== 'ios') {
    return;
  }

  try {
    // Check if database is already synced with current version
    const syncedVersion = await SharedGroupPreferences.getItem(
      DATABASE_VERSION_KEY,
      APP_GROUP
    );

    if (syncedVersion === CURRENT_DATABASE_VERSION) {
      console.log('Insult database already synced with widget (version ' + CURRENT_DATABASE_VERSION + ')');
      return;
    }

    // Extract just the insult text to minimize storage
    const insultTexts = insults.map(item => item.insult || item);

    const data = {
      insults: insultTexts,
      version: CURRENT_DATABASE_VERSION,
      syncedAt: new Date().toISOString(),
      count: insultTexts.length,
    };

    await SharedGroupPreferences.setItem(
      INSULT_DATABASE_KEY,
      JSON.stringify(data),
      APP_GROUP
    );

    await SharedGroupPreferences.setItem(
      DATABASE_VERSION_KEY,
      CURRENT_DATABASE_VERSION,
      APP_GROUP
    );

    console.log('Synced ' + insultTexts.length + ' insults with widget');

    // Trigger widget to reload with new database
    try {
      WidgetKit.reloadAllTimelines();
      console.log('Widget timeline reloaded');
    } catch (reloadError) {
      console.log('Widget reload not available:', reloadError.message);
    }
  } catch (error) {
    console.error('Error syncing insult database with widget:', error);
  }
}
