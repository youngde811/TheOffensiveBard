// Utility for reading and analyzing widget timeline data

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

const APP_GROUP = 'group.com.bosshog811.TheInsolentBard';
const INSULT_DATABASE_KEY = 'insultDatabase';

/**
 * Read the widget insult database from shared UserDefaults
 * @returns {Promise<Object|null>} Widget data or null
 */
export async function getWidgetDatabase() {
  if (Platform.OS !== 'ios') {
    return null;
  }

  try {
    const dataString = await SharedGroupPreferences.getItem(INSULT_DATABASE_KEY, APP_GROUP);

    if (!dataString) {
      return null;
    }

    return JSON.parse(dataString);
  } catch (error) {
    console.error('Failed to read widget database:', error);
    return null;
  }
}

/**
 * Generate the same 48-hour timeline that the widget would create
 * This recreates the timeline entries for visualization
 * @returns {Promise<Array>} Array of timeline entries
 */
export async function getWidgetTimeline() {
  const database = await getWidgetDatabase();

  if (!database || !database.insults || database.insults.length === 0) {
    return [];
  }

  const { insults } = database;
  const timeline = [];
  const now = new Date();

  // Widget generates 48 entries (one per hour)
  // We'll randomly select 48 insults like the widget does
  const selectedInsults = selectRandomInsults(insults, 48);

  for (let i = 0; i < selectedInsults.length; i++) {
    const entryDate = new Date(now.getTime() + (i * 60 * 60 * 1000)); // Add i hours

    timeline.push({
      index: i,
      timestamp: entryDate.toISOString(),
      insult: selectedInsults[i],
      isPast: entryDate < now,
      isCurrent: i === 0, // First entry is current
    });
  }

  return timeline;
}

/**
 * Get timeline statistics
 * @returns {Promise<Object>} Timeline stats
 */
export async function getTimelineStats() {
  const database = await getWidgetDatabase();

  if (!database) {
    return {
      totalInsults: 0,
      syncedAt: null,
      backgroundColor: null,
      timelineLength: 0,
    };
  }

  return {
    totalInsults: database.count || 0,
    syncedAt: database.syncedAt,
    backgroundColor: database.widgetBackgroundColor,
    timelineLength: 48, // Widget always creates 48 entries
  };
}

/**
 * Fisher-Yates shuffle for random selection (matches widget logic)
 */
function selectRandomInsults(insults, count) {
  const shuffled = [...insults];

  for (let i = shuffled.length - 1; i >= 1; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled.slice(0, Math.min(count, shuffled.length));
}
