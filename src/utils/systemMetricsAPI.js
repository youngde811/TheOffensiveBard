// System Metrics API - Interface to native iOS system metrics module

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

import { NativeModules, Platform } from 'react-native';

const { SystemMetrics: NativeSystemMetrics } = NativeModules;

/**
 * Get current system metrics (memory, CPU, battery, disk, threads)
 * @returns {Promise<Object>} System metrics object
 *
 * Returns:
 * {
 *   memory: { used: number (MB), total: number (MB), usedBytes: number, totalBytes: number },
 *   cpu: { usage: number (%), threadCount: number },
 *   threads: number,
 *   battery: { level: number (%), state: string, isCharging: boolean },
 *   disk: { used: number (GB), free: number (GB), total: number (GB), usedBytes, freeBytes, totalBytes },
 *   timestamp: number (Unix timestamp)
 * }
 */
export async function getSystemMetrics() {
  if (Platform.OS !== 'ios') {
    throw new Error('SystemMetrics is only available on iOS');
  }

  if (!NativeSystemMetrics) {
    throw new Error('SystemMetrics native module is not available');
  }

  return NativeSystemMetrics.getMetrics();
}

export default {
  getMetrics: getSystemMetrics,
};
