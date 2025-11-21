// Metrics Collection Service - Track app state transitions and performance metrics

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

import AsyncStorage from '@react-native-async-storage/async-storage';
import { debugLogger } from './debugLogger';

const METRICS_KEY_PREFIX = '@insolentbard:metrics:';
const APP_STATE_KEY = `${METRICS_KEY_PREFIX}appState`;
const COLD_START_KEY = `${METRICS_KEY_PREFIX}coldStart`;
const MAX_EVENTS = 100;
const MAX_AGE_DAYS = 7;
const MAX_COLD_START_RECORDS = 10;

/**
 * Record an app state transition
 * @param {string} state - The new app state (active, background, inactive)
 */
export async function recordAppStateTransition(state) {
  try {
    const event = {
      timestamp: new Date().toISOString(),
      state: state,
      type: 'app_state',
    };

    const events = await getAppStateHistory();
    events.push(event);

    // Prune old events
    const prunedEvents = pruneEvents(events);

    await AsyncStorage.setItem(APP_STATE_KEY, JSON.stringify(prunedEvents));

    debugLogger.debug(`App state transition: ${state}`);
  } catch (error) {
    debugLogger.error(`Failed to record app state: ${error.message}`);
  }
}

/**
 * Get app state transition history
 * @returns {Promise<Array>} Array of state transition events
 */
export async function getAppStateHistory() {
  try {
    const data = await AsyncStorage.getItem(APP_STATE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    debugLogger.error(`Failed to read app state history: ${error.message}`);
    return [];
  }
}

/**
 * Get app state statistics
 * @returns {Promise<Object>} Statistics about app state transitions
 */
export async function getAppStateStats() {
  const events = await getAppStateHistory();

  if (events.length === 0) {
    return {
      totalTransitions: 0,
      lastState: null,
      lastTransition: null,
      stateCount: {},
    };
  }

  const stateCount = events.reduce((acc, event) => {
    acc[event.state] = (acc[event.state] || 0) + 1;
    return acc;
  }, {});

  const lastEvent = events[events.length - 1];

  return {
    totalTransitions: events.length,
    lastState: lastEvent.state,
    lastTransition: lastEvent.timestamp,
    stateCount,
  };
}

/**
 * Calculate time spent in each state
 * @returns {Promise<Object>} Time spent in each state (in milliseconds)
 */
export async function getStateTimeBreakdown() {
  const events = await getAppStateHistory();

  if (events.length < 2) {
    return {};
  }

  const timeSpent = {};

  for (let i = 0; i < events.length - 1; i++) {
    const currentEvent = events[i];
    const nextEvent = events[i + 1];

    const duration = new Date(nextEvent.timestamp) - new Date(currentEvent.timestamp);
    timeSpent[currentEvent.state] = (timeSpent[currentEvent.state] || 0) + duration;
  }

  return timeSpent;
}

/**
 * Clear all app state metrics
 */
export async function clearAppStateMetrics() {
  try {
    await AsyncStorage.removeItem(APP_STATE_KEY);
    debugLogger.info('App state metrics cleared');
  } catch (error) {
    debugLogger.error(`Failed to clear app state metrics: ${error.message}`);
  }
}

/**
 * Clear all metrics data
 */
export async function clearAllMetrics() {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const metricsKeys = keys.filter(key => key.startsWith(METRICS_KEY_PREFIX));
    await AsyncStorage.multiRemove(metricsKeys);
    debugLogger.info('All metrics cleared');
  } catch (error) {
    debugLogger.error(`Failed to clear all metrics: ${error.message}`);
  }
}

/**
 * Prune old events based on MAX_EVENTS and MAX_AGE_DAYS
 * @param {Array} events - Array of events to prune
 * @returns {Array} Pruned array of events
 */
function pruneEvents(events) {
  const now = new Date();
  const maxAgeMs = MAX_AGE_DAYS * 24 * 60 * 60 * 1000;

  // Remove events older than MAX_AGE_DAYS
  let filtered = events.filter(event => {
    const age = now - new Date(event.timestamp);
    return age < maxAgeMs;
  });

  // Keep only the last MAX_EVENTS
  if (filtered.length > MAX_EVENTS) {
    filtered = filtered.slice(filtered.length - MAX_EVENTS);
  }

  return filtered;
}

// ==================== PERFORMANCE METRICS ====================

/**
 * Record a cold start time
 * @param {number} durationMs - Cold start duration in milliseconds
 */
export async function recordColdStart(durationMs) {
  try {
    const event = {
      timestamp: new Date().toISOString(),
      duration: durationMs,
      type: 'cold_start',
    };

    const records = await getColdStartHistory();
    records.push(event);

    // Keep only last MAX_COLD_START_RECORDS
    const trimmed = records.slice(-MAX_COLD_START_RECORDS);

    await AsyncStorage.setItem(COLD_START_KEY, JSON.stringify(trimmed));

    debugLogger.debug(`Cold start recorded: ${durationMs}ms`);
  } catch (error) {
    debugLogger.error(`Failed to record cold start: ${error.message}`);
  }
}

/**
 * Get cold start history
 * @returns {Promise<Array>} Array of cold start events
 */
export async function getColdStartHistory() {
  try {
    const data = await AsyncStorage.getItem(COLD_START_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    debugLogger.error(`Failed to read cold start history: ${error.message}`);
    return [];
  }
}

/**
 * Get cold start statistics
 * @returns {Promise<Object>} Cold start stats
 */
export async function getColdStartStats() {
  const records = await getColdStartHistory();

  if (records.length === 0) {
    return {
      count: 0,
      average: 0,
      min: 0,
      max: 0,
      last: null,
    };
  }

  const durations = records.map(r => r.duration);
  const sum = durations.reduce((a, b) => a + b, 0);
  const average = sum / durations.length;
  const min = Math.min(...durations);
  const max = Math.max(...durations);
  const last = records[records.length - 1];

  return {
    count: records.length,
    average: Math.round(average),
    min,
    max,
    last: last.duration,
    lastTimestamp: last.timestamp,
  };
}

/**
 * Get storage metrics
 * @returns {Promise<Object>} Storage statistics
 */
export async function getStorageMetrics() {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const allData = await AsyncStorage.multiGet(keys);

    let totalSize = 0;
    const breakdown = {};

    allData.forEach(([key, value]) => {
      const size = value ? value.length : 0;
      totalSize += size;

      // Categorize by key prefix
      if (key.startsWith('@insolentbard:metrics:')) {
        breakdown.metrics = (breakdown.metrics || 0) + size;
      } else if (key.startsWith('@insolentbard:settings:')) {
        breakdown.settings = (breakdown.settings || 0) + size;
      } else if (key.startsWith('@insolentbard:logs:')) {
        breakdown.logs = (breakdown.logs || 0) + size;
      } else if (key === 'favoriteInsults') {
        breakdown.favorites = (breakdown.favorites || 0) + size;
      } else {
        breakdown.other = (breakdown.other || 0) + size;
      }
    });

    return {
      totalKeys: keys.length,
      totalSizeBytes: totalSize,
      totalSizeKB: (totalSize / 1024).toFixed(2),
      breakdown,
    };
  } catch (error) {
    debugLogger.error(`Failed to get storage metrics: ${error.message}`);
    return {
      totalKeys: 0,
      totalSizeBytes: 0,
      totalSizeKB: '0.00',
      breakdown: {},
    };
  }
}

/**
 * Export metrics as JSON for debugging
 * @returns {Promise<Object>} All metrics data
 */
export async function exportMetrics() {
  try {
    const appState = await getAppStateHistory();
    const appStateStats = await getAppStateStats();
    const stateTimeBreakdown = await getStateTimeBreakdown();
    const coldStart = await getColdStartHistory();
    const coldStartStats = await getColdStartStats();
    const storage = await getStorageMetrics();

    return {
      exportedAt: new Date().toISOString(),
      appState: {
        events: appState,
        stats: appStateStats,
        timeBreakdown: stateTimeBreakdown,
      },
      performance: {
        coldStart: {
          events: coldStart,
          stats: coldStartStats,
        },
        storage,
      },
    };
  } catch (error) {
    debugLogger.error(`Failed to export metrics: ${error.message}`);
    return null;
  }
}
