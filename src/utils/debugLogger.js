// -*- mode: rjsx; eval: (auto-fill-mode 1); -*-

// This file contains the app's debugging logger with support for widget logs.

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
import AsyncStorage from '@react-native-async-storage/async-storage';

const APP_GROUP = 'group.com.bosshog811.TheInsolentBard';
const WIDGET_LOGS_KEY = 'widgetLogs';
const LOG_LEVEL_KEY = '@insolentbard:settings:logLevel';

// Log levels in order of verbosity (lower number = less verbose)
export const LOG_LEVELS = {
  ERROR: { value: 0, label: 'Error' },
  WARNING: { value: 1, label: 'Warning' },
  SUCCESS: { value: 2, label: 'Success' },
  INFO: { value: 3, label: 'Info' },
  DEBUG: { value: 4, label: 'Debug' },
};

const DEFAULT_LOG_LEVEL = LOG_LEVELS.INFO.value;

class DebugLogger {
  constructor() {
    this.logs = [];
    this.maxLogs = 100; // Keep last 100 log entries
    this.currentLogLevel = DEFAULT_LOG_LEVEL;
    this.loadLogLevel();
  }

  async loadLogLevel() {
    try {
      const level = await AsyncStorage.getItem(LOG_LEVEL_KEY);
      if (level !== null) {
        this.currentLogLevel = parseInt(level, 10);
      }
    } catch (error) {
      console.error('Failed to load log level:', error);
    }
  }

  async setLogLevel(level) {
    try {
      this.currentLogLevel = level;
      await AsyncStorage.setItem(LOG_LEVEL_KEY, level.toString());
    } catch (error) {
      console.error('Failed to save log level:', error);
    }
  }

  getLogLevel() {
    return this.currentLogLevel;
  }

  shouldLog(messageLevel) {
    return messageLevel <= this.currentLogLevel;
  }

  log(message, type = 'info', level = LOG_LEVELS.INFO.value) {
    // Check if this log level should be captured
    if (!this.shouldLog(level)) {
      return;
    }

    const entry = {
      timestamp: new Date().toISOString(),
      type,
      message: String(message),
      level,
    };

    this.logs.push(entry);

    // Keep only last maxLogs entries
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // Also log to console
    console.log(`[Debug ${type.toUpperCase()}] ${message}`);
  }

  debug(message) {
    this.log(message, 'debug', LOG_LEVELS.DEBUG.value);
  }

  info(message) {
    this.log(message, 'info', LOG_LEVELS.INFO.value);
  }

  success(message) {
    this.log(message, 'success', LOG_LEVELS.SUCCESS.value);
  }

  warning(message) {
    this.log(message, 'warning', LOG_LEVELS.WARNING.value);
  }

  error(message) {
    this.log(message, 'error', LOG_LEVELS.ERROR.value);
  }

  /**
   * Get widget logs from shared UserDefaults
   * @returns {Promise<Array>} Array of widget log entries (JSON objects)
   */
  async getWidgetLogs() {
    if (Platform.OS !== 'ios') {
      return [];
    }

    try {
      const logsJson = await SharedGroupPreferences.getItem(WIDGET_LOGS_KEY, APP_GROUP);

      if (!logsJson) {
        return [];
      }

      const logs = JSON.parse(logsJson);

      return Array.isArray(logs) ? logs : [];
    } catch (error) {
      console.error('Failed to read widget logs:', error);
      return [];
    }
  }

  /**
   * Map widget log type to log level value
   */
  getLogLevelFromType(type) {
    const typeMap = {
      'error': LOG_LEVELS.ERROR.value,
      'warning': LOG_LEVELS.WARNING.value,
      'success': LOG_LEVELS.SUCCESS.value,
      'info': LOG_LEVELS.INFO.value,
      'debug': LOG_LEVELS.DEBUG.value,
    };
    return typeMap[type] || LOG_LEVELS.INFO.value;
  }

  /**
   * Get all logs (app + widget) merged and sorted by timestamp
   * Filters logs based on current log level
   * @returns {Promise<Array>} Array of all log entries sorted newest first
   */
  async getAllLogs() {
    const widgetLogs = await this.getWidgetLogs();

    // Mark widget logs with source and add level if missing
    const markedWidgetLogs = widgetLogs.map(log => ({
      ...log,
      source: 'widget',
      level: log.level ?? this.getLogLevelFromType(log.type),
    }));

    // Mark app logs with source
    const markedAppLogs = this.logs.map(log => ({
      ...log,
      source: 'app',
    }));

    // Merge, filter by log level, and sort by timestamp (newest first)
    const allLogs = [...markedAppLogs, ...markedWidgetLogs]
      .filter(log => log.level <= this.currentLogLevel)
      .sort((a, b) => {
        return new Date(b.timestamp) - new Date(a.timestamp);
      });

    return allLogs;
  }

  getLogs() {
    return [...this.logs];
  }

  clear() {
    this.logs = [];
  }

  /**
   * Clear widget logs from shared UserDefaults
   */
  async clearWidgetLogs() {
    try {
      await SharedGroupPreferences.setItem(WIDGET_LOGS_KEY, JSON.stringify([]), APP_GROUP);
      
      console.log('Widget logs cleared');
    } catch (error) {
      console.error('Failed to clear widget logs:', error);
    }
  }

  /**
   * Clear both app and widget logs
   */
  async clearAllLogs() {
    this.clear();
    
    await this.clearWidgetLogs();
  }

  getLogsAsText() {
    return this.logs
      .map(entry => `[${entry.timestamp}] [${entry.type.toUpperCase()}] ${entry.message}`)
      .join('\n');
  }

  /**
   * Get all logs (app + widget) as formatted text
   * @returns {Promise<string>} Formatted log text
   */
  async getAllLogsAsText() {
    const allLogs = await this.getAllLogs();

    return allLogs
      .map(entry => `[${entry.timestamp}] [${entry.source.toUpperCase()}] [${entry.type.toUpperCase()}] ${entry.message}`)
      .join('\n');
  }
}

// Export singleton instance
export const debugLogger = new DebugLogger();
