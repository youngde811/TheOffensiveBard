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

import { Platform, Alert } from 'react-native';
import SharedGroupPreferences from 'react-native-shared-group-preferences';
import WidgetKit from 'react-native-widgetkit';

const APP_GROUP = 'group.com.bosshog811.TheInsolentBard';
const INSULT_DATABASE_KEY = 'insultDatabase';
const DATABASE_VERSION_KEY = 'insultDatabaseVersion';
const CURRENT_DATABASE_VERSION = '2.4.8'; // Increment when insults.json changes

/**
 * Sync full insult database to App Group UserDefaults for autonomous widget operation
 * This allows the widget to generate its own timeline without app intervention
 * @param {Array} insults - Array of all insult objects from insults-10k.json
 */
export async function syncInsultDatabaseWithWidget(insults) {
  if (Platform.OS !== 'ios') {
    console.log('[Widget Sync] Skipping - not iOS');
    return;
  }

  try {
    console.log('[Widget Sync] Starting sync with ' + insults.length + ' insults');

    // Check if database is already synced with current version
    const syncedVersion = await SharedGroupPreferences.getItem(
      DATABASE_VERSION_KEY,
      APP_GROUP
    );

    console.log('[Widget Sync] Current synced version:', syncedVersion);

    if (syncedVersion === CURRENT_DATABASE_VERSION) {
      console.log('[Widget Sync] Database already synced with version ' + CURRENT_DATABASE_VERSION);
      // Force reload anyway to ensure widget has latest timeline
      try {
        WidgetKit.reloadAllTimelines();
        console.log('[Widget Sync] Forced widget timeline reload');
      } catch (reloadError) {
        console.log('[Widget Sync] Widget reload not available:', reloadError.message);
      }
      Alert.alert(
        'Widget Already Synced',
        `Database version ${CURRENT_DATABASE_VERSION} already synced. Widget timeline reloaded.`,
        [{ text: 'OK' }]
      );
      return;
    }

    console.log('[Widget Sync] Syncing new database version ' + CURRENT_DATABASE_VERSION);

    // Extract just the insult text to minimize storage
    const insultTexts = insults.map(item => item.insult || item);

    console.log('[Widget Sync] Extracted ' + insultTexts.length + ' insult texts');
    console.log('[Widget Sync] Sample insult:', insultTexts[0]);

    const data = {
      insults: insultTexts,
      version: CURRENT_DATABASE_VERSION,
      syncedAt: new Date().toISOString(),
      count: insultTexts.length,
    };

    console.log('[Widget Sync] Writing to key:', INSULT_DATABASE_KEY);
    console.log('[Widget Sync] App Group:', APP_GROUP);

    await SharedGroupPreferences.setItem(
      INSULT_DATABASE_KEY,
      JSON.stringify(data),
      APP_GROUP
    );

    console.log('[Widget Sync] Database written successfully');

    await SharedGroupPreferences.setItem(
      DATABASE_VERSION_KEY,
      CURRENT_DATABASE_VERSION,
      APP_GROUP
    );

    console.log('[Widget Sync] Version key written');

    // Verify the write
    const verification = await SharedGroupPreferences.getItem(
      INSULT_DATABASE_KEY,
      APP_GROUP
    );

    if (verification) {
      const parsed = JSON.parse(verification);
      console.log('[Widget Sync] VERIFICATION: Successfully read back ' + parsed.count + ' insults');
    } else {
      console.error('[Widget Sync] VERIFICATION FAILED: Could not read back data');
      Alert.alert(
        'Widget Sync Error',
        'Verification failed: Could not read back widget data. Check console logs.',
        [{ text: 'OK' }]
      );
      return;
    }

    console.log('[Widget Sync] Synced ' + insultTexts.length + ' insults with widget');

    // Trigger widget to reload with new database
    try {
      WidgetKit.reloadAllTimelines();
      console.log('[Widget Sync] Widget timeline reloaded');
    } catch (reloadError) {
      console.log('[Widget Sync] Widget reload not available:', reloadError.message);
    }

    // Show success alert
    Alert.alert(
      'Widget Sync Success!',
      `Successfully synced ${insultTexts.length} insults to widget (v${CURRENT_DATABASE_VERSION}). Widget timeline reloaded.`,
      [{ text: 'OK' }]
    );
  } catch (error) {
    console.error('[Widget Sync] ERROR syncing insult database with widget:', error);
    console.error('[Widget Sync] Error details:', error.message, error.stack);
    Alert.alert(
      'Widget Sync Failed',
      `Error: ${error.message}\n\nCheck console logs for details.`,
      [{ text: 'OK' }]
    );
  }
}
