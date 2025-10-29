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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { debugLogger } from './debugLogger';

const APP_GROUP = 'group.com.bosshog811.TheInsolentBard';
const INSULT_DATABASE_KEY = 'insultDatabase';
const DATABASE_VERSION_KEY = 'insultDatabaseVersion';
const CURRENT_DATABASE_VERSION = '2.5.3'; // Increment when insults.json changes
const WIDGET_INSULT_COUNT = 1000; // Number of insults to sync to widget (reduces data size)

// Settings keys (must match SettingsContext)
const SETTINGS_KEYS = {
  WIDGET_BACKGROUND_COLOR: '@insolentbard:settings:widgetBackgroundColor',
  WIDGET_BACKGROUND_OPACITY: '@insolentbard:settings:widgetBackgroundOpacity',
};

// Defaults
const DEFAULT_WIDGET_BACKGROUND_COLOR = '#f1eee5';
const DEFAULT_WIDGET_BACKGROUND_OPACITY = 100;

/**
 * Sync a random subset of insults to App Group UserDefaults for autonomous widget operation
 * This allows the widget to generate its own timeline without app intervention
 * @param {Array} insults - Array of all insult objects from insults-10k.json
 */
export async function syncInsultDatabaseWithWidget(insults) {
  if (Platform.OS !== 'ios') {
    debugLogger.info('Skipping sync - not iOS');
    return;
  }

  // Check if SharedGroupPreferences is available (required)
  if (!SharedGroupPreferences) {
    debugLogger.error('SharedGroupPreferences module not available');
    
    Alert.alert(
      'Widget Sync Failed',
      'SharedGroupPreferences module not available',
      [{ text: 'OK' }]
    );
    
    return;
  }

  debugLogger.info('SharedGroupPreferences module loaded successfully');

  try {
    debugLogger.info('Starting sync with ' + insults.length + ' insults');
    debugLogger.info('Will reduce to ' + WIDGET_INSULT_COUNT + ' insults in Step 2');

    // Test App Group access first
    debugLogger.info('Testing App Group access...');
    debugLogger.info('App Group ID: ' + APP_GROUP);

    try {
      await SharedGroupPreferences.setItem('test_key', 'test_value', APP_GROUP);
      
      debugLogger.success('Test write succeeded');

      const testRead = await SharedGroupPreferences.getItem('test_key', APP_GROUP);
      debugLogger.success('Test read succeeded: ' + testRead);
    } catch (testError) {
      debugLogger.error('App Group test failed: ' + testError);
      debugLogger.error('This means the App Group is not accessible');

      throw testError;
    }

    // Check if database is already synced with current version
    debugLogger.info('Step 1: Reading current version from UserDefaults...');

    let syncedVersion = null;

    try {
      syncedVersion = await SharedGroupPreferences.getItem(
        DATABASE_VERSION_KEY,
        APP_GROUP
      );
      
      debugLogger.info('Step 1 complete: Current synced version: ' + syncedVersion);
    } catch (versionError) {
      // Key might not exist on first run - that's okay
      debugLogger.info('Step 1: No existing version found (first sync): ' + versionError);

      syncedVersion = null;
    }

    if (syncedVersion === CURRENT_DATABASE_VERSION) {
      debugLogger.info('Database already synced with version ' + CURRENT_DATABASE_VERSION);
      debugLogger.info('Sync complete - database already up to date');

      return;
    }

    debugLogger.info('Syncing new database version ' + CURRENT_DATABASE_VERSION);

    // Extract just the insult text to minimize storage
    debugLogger.info('Step 2: Extracting and sampling insult texts...');

    const allInsultTexts = insults.map(item => item.insult || item);

    // Randomly select a subset for the widget (reduces data size)
    const shuffled = [...allInsultTexts].sort(() => Math.random() - 0.5);
    const insultTexts = shuffled.slice(0, WIDGET_INSULT_COUNT);

    debugLogger.info('Step 2 complete: Selected ' + insultTexts.length + ' insults from ' + allInsultTexts.length + ' total');
    debugLogger.info('Sample insult: ' + insultTexts[0]);

    debugLogger.info('Step 3: Reading widget customization settings...');

    // Load widget background preferences
    let widgetBackgroundColor = DEFAULT_WIDGET_BACKGROUND_COLOR;
    let widgetBackgroundOpacity = DEFAULT_WIDGET_BACKGROUND_OPACITY;

    try {
      const bgColor = await AsyncStorage.getItem(SETTINGS_KEYS.WIDGET_BACKGROUND_COLOR);
      const bgOpacity = await AsyncStorage.getItem(SETTINGS_KEYS.WIDGET_BACKGROUND_OPACITY);

      if (bgColor !== null) {
        widgetBackgroundColor = bgColor;
      }
      if (bgOpacity !== null) {
        widgetBackgroundOpacity = parseInt(bgOpacity, 10);
      }

      debugLogger.info('Step 3: Widget background color: ' + widgetBackgroundColor);
      debugLogger.info('Step 3: Widget background opacity: ' + widgetBackgroundOpacity + '%');
    } catch (settingsError) {
      debugLogger.error('Step 3: Error reading widget settings, using defaults: ' + settingsError);
    }

    debugLogger.info('Step 4: Preparing data object...');

    const data = {
      insults: insultTexts,
      version: CURRENT_DATABASE_VERSION,
      syncedAt: new Date().toISOString(),
      count: insultTexts.length,
      widgetBackgroundColor: widgetBackgroundColor,
      widgetBackgroundOpacity: widgetBackgroundOpacity,
    };

    debugLogger.info('Step 4 complete: Data object ready');

    debugLogger.info('Step 5: Writing database to UserDefaults...');
    debugLogger.info('  Key: ' + INSULT_DATABASE_KEY);
    debugLogger.info('  App Group: ' + APP_GROUP);
    debugLogger.info('  Data size: ' + JSON.stringify(data).length + ' characters');

    await SharedGroupPreferences.setItem(
      INSULT_DATABASE_KEY,
      JSON.stringify(data),
      APP_GROUP
    );

    debugLogger.success('Step 5 complete: Database written successfully');

    debugLogger.info('Step 6: Writing version key...');

    await SharedGroupPreferences.setItem(
      DATABASE_VERSION_KEY,
      CURRENT_DATABASE_VERSION,
      APP_GROUP
    );

    debugLogger.success('Step 6 complete: Version key written');

    // Verify the write
    debugLogger.info('Step 7: Verifying write by reading back...');

    const verification = await SharedGroupPreferences.getItem(
      INSULT_DATABASE_KEY,
      APP_GROUP
    );

    if (verification) {
      try {
        const parsed = JSON.parse(verification);

        debugLogger.success('Step 7 complete: Successfully read back ' + parsed.count + ' insults');
        debugLogger.success('Verified background color: ' + (parsed.widgetBackgroundColor || 'not set'));
        debugLogger.success('Verified background opacity: ' + (parsed.widgetBackgroundOpacity || 'not set') + '%');
      } catch (parseError) {
        debugLogger.error('Step 7 failed: Could not parse verification data: ' + parseError.message);

        Alert.alert(
          'Widget Sync Error',
          'Verification failed: Data corrupted. Check debug logs.',
          [{ text: 'OK' }]
        );

        return;
      }
    } else {
      debugLogger.error('Step 7 failed: Could not read back data from UserDefaults');

      Alert.alert(
        'Widget Sync Error',
        'Verification failed: Could not read back widget data. Check debug logs.',
        [{ text: 'OK' }]
      );

      return;
    }

    debugLogger.success('All steps complete! Synced ' + insultTexts.length + ' insults with widget');
    debugLogger.success('Sync complete! Widget will reload automatically');
  } catch (error) {
    debugLogger.error('FATAL ERROR during sync: ' + error);
    debugLogger.error('Error type: ' + typeof error);
    debugLogger.error('Error name: ' + (error?.name || 'N/A'));
    debugLogger.error('Error message: ' + (error?.message || 'N/A'));
    debugLogger.error('Error code: ' + (error?.code || 'N/A'));
    debugLogger.error('Error stack: ' + (error?.stack || 'N/A'));

    try {
      debugLogger.error('Error as JSON: ' + JSON.stringify(error, null, 2));
    } catch (jsonError) {
      debugLogger.error('Could not stringify error: ' + jsonError);
    }

    let errorMessage = 'Unknown error';

    if (error && error.message) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    } else if (typeof error === 'number') {
      errorMessage = `Error code: ${error} (native module error)`;
    } else if (error) {
      errorMessage = JSON.stringify(error);
    }

    debugLogger.error('Final error message: ' + errorMessage);

    Alert.alert(
      'Widget Sync Failed',
      `Error: ${errorMessage}\n\nType: ${typeof error}\n\nCheck Widget Debug screen for detailed logs.`,
      [{ text: 'OK' }]
    );
  }
}
