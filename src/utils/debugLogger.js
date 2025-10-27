// Debug logger for widget sync debugging

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
