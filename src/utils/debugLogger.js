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

const APP_GROUP = 'group.com.bosshog811.TheInsolentBard';
const WIDGET_LOGS_KEY = 'widgetLogs';

class DebugLogger {
  constructor() {
    this.logs = [];
    this.maxLogs = 100; // Keep last 100 log entries
  }

  log(message, type = 'info') {
    const entry = {
      timestamp: new Date().toISOString(),
      type,
      message: String(message),
    };

    this.logs.push(entry);

    // Keep only last maxLogs entries
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // Also log to console
    console.log(`[Debug ${type.toUpperCase()}] ${message}`);
  }

  error(message) {
    this.log(message, 'error');
  }

  info(message) {
    this.log(message, 'info');
  }

  success(message) {
    this.log(message, 'success');
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
   * Get all logs (app + widget) merged and sorted by timestamp
   * @returns {Promise<Array>} Array of all log entries sorted newest first
   */
  async getAllLogs() {
    const widgetLogs = await this.getWidgetLogs();

    // Mark widget logs with source
    const markedWidgetLogs = widgetLogs.map(log => ({
      ...log,
      source: 'widget',
    }));

    // Mark app logs with source
    const markedAppLogs = this.logs.map(log => ({
      ...log,
      source: 'app',
    }));

    // Merge and sort by timestamp (newest first)
    const allLogs = [...markedAppLogs, ...markedWidgetLogs].sort((a, b) => {
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
    if (Platform.OS !== 'ios') {
      return;
    }

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
