// -*- mode: rjsx; eval: (auto-fill-mode 1); -*-

// This file contains the app's debugging logger.

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

  getLogs() {
    return [...this.logs];
  }

  clear() {
    this.logs = [];
  }

  getLogsAsText() {
    return this.logs
      .map(entry => `[${entry.timestamp}] [${entry.type.toUpperCase()}] ${entry.message}`)
      .join('\n');
  }
}

// Export singleton instance
export const debugLogger = new DebugLogger();
