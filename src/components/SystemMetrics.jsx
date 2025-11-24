// System Metrics Component - Visualizes iOS system resource usage

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

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, StyleSheet, RefreshControl, Platform } from 'react-native';

import { useTheme } from '../contexts/ThemeContext';
import { getSystemMetrics } from '../utils/systemMetricsAPI';

export default function SystemMetrics() {
  const { colors } = useTheme();
  const [metrics, setMetrics] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const intervalRef = useRef(null);

  const loadData = async () => {
    try {
      setError(null);
      const data = await getSystemMetrics();
      setMetrics(data);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    loadData();

    // Auto-refresh every 5 seconds
    intervalRef.current = setInterval(loadData, 5000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadData();
    setIsRefreshing(false);
  };

  const formatMemory = (mb) => {
    if (mb >= 1024) {
      return `${(mb / 1024).toFixed(2)} GB`;
    }
    return `${mb.toFixed(1)} MB`;
  };

  const formatDisk = (gb) => {
    return `${gb.toFixed(2)} GB`;
  };

  const getBatteryIcon = (state) => {
    switch (state) {
      case 'charging':
        return '🔌';
      case 'full':
        return '🔋';
      case 'unplugged':
        return '🪫';
      default:
        return '❓';
    }
  };

  const getBatteryColor = (level) => {
    if (level >= 50) return '#4caf50';
    if (level >= 20) return '#ff9800';
    return '#f44336';
  };

  if (Platform.OS !== 'ios') {
    return (
      <View style={[styles.container, { backgroundColor: colors.surface }]}>
        <Text style={[styles.errorText, { color: colors.textMuted }]}>
          System metrics are only available on iOS
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { backgroundColor: colors.surface }]}>
        <Text style={[styles.errorText, { color: colors.error }]}>
          Error loading metrics: {error}
        </Text>
      </View>
    );
  }

  if (!metrics) {
    return (
      <View style={[styles.container, { backgroundColor: colors.surface }]}>
        <Text style={[styles.loadingText, { color: colors.textMuted }]}>
          Loading system metrics...
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {/* Memory Section */}
        <View style={[styles.section, { backgroundColor: colors.background }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionIcon, { fontSize: 24 }]}>🧠</Text>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Memory</Text>
          </View>

          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>App Usage</Text>
              <Text style={[styles.statValue, { color: colors.primary }]}>
                {formatMemory(metrics.memory.used)}
              </Text>
            </View>

            <View style={styles.statBox}>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>Device Total</Text>
              <Text style={[styles.statValue, { color: colors.text }]}>
                {formatMemory(metrics.memory.total)}
              </Text>
            </View>

            <View style={styles.statBox}>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>Usage %</Text>
              <Text style={[styles.statValue, { color: colors.text }]}>
                {((metrics.memory.used / metrics.memory.total) * 100).toFixed(1)}%
              </Text>
            </View>
          </View>
        </View>

        {/* CPU Section */}
        <View style={[styles.section, { backgroundColor: colors.background }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionIcon, { fontSize: 24 }]}>⚙️</Text>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>CPU</Text>
          </View>

          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>Usage</Text>
              <Text style={[styles.statValue, { color: colors.primary }]}>
                {metrics.cpu.usage.toFixed(1)}%
              </Text>
            </View>

            <View style={styles.statBox}>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>Threads</Text>
              <Text style={[styles.statValue, { color: colors.text }]}>
                {metrics.cpu.threadCount}
              </Text>
            </View>
          </View>
        </View>

        {/* Battery Section */}
        <View style={[styles.section, { backgroundColor: colors.background }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionIcon, { fontSize: 24 }]}>{getBatteryIcon(metrics.battery.state)}</Text>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Battery</Text>
          </View>

          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>Level</Text>
              <Text style={[styles.statValue, { color: getBatteryColor(metrics.battery.level) }]}>
                {metrics.battery.level >= 0 ? `${metrics.battery.level.toFixed(0)}%` : 'Unknown'}
              </Text>
            </View>

            <View style={styles.statBox}>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>State</Text>
              <Text style={[styles.statValue, { color: colors.text, textTransform: 'capitalize' }]}>
                {metrics.battery.state}
              </Text>
            </View>

            <View style={styles.statBox}>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>Charging</Text>
              <Text style={[styles.statValue, { color: metrics.battery.isCharging ? '#4caf50' : colors.text }]}>
                {metrics.battery.isCharging ? 'Yes' : 'No'}
              </Text>
            </View>
          </View>
        </View>

        {/* Disk Section */}
        <View style={[styles.section, { backgroundColor: colors.background }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionIcon, { fontSize: 24 }]}>💿</Text>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Disk Storage</Text>
          </View>

          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>Used</Text>
              <Text style={[styles.statValue, { color: colors.primary }]}>
                {formatDisk(metrics.disk.used)}
              </Text>
            </View>

            <View style={styles.statBox}>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>Free</Text>
              <Text style={[styles.statValue, { color: '#4caf50' }]}>
                {formatDisk(metrics.disk.free)}
              </Text>
            </View>

            <View style={styles.statBox}>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>Total</Text>
              <Text style={[styles.statValue, { color: colors.text }]}>
                {formatDisk(metrics.disk.total)}
              </Text>
            </View>

            <View style={styles.statBox}>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>Usage %</Text>
              <Text style={[styles.statValue, { color: colors.text }]}>
                {((metrics.disk.used / metrics.disk.total) * 100).toFixed(1)}%
              </Text>
            </View>
          </View>
        </View>

        {/* Info Section */}
        <View style={[styles.section, { backgroundColor: colors.background }]}>
          <Text style={[styles.infoText, { color: colors.textMuted }]}>
            Auto-refreshing every 5 seconds
          </Text>
          <Text style={[styles.timestamp, { color: colors.textMuted }]}>
            Last updated: {new Date(metrics.timestamp * 1000).toLocaleTimeString()}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingBottom: 20,
  },
  loadingText: {
    textAlign: 'center',
    padding: 20,
    fontSize: 14,
  },
  errorText: {
    textAlign: 'center',
    padding: 20,
    fontSize: 14,
    fontStyle: 'italic',
  },
  section: {
    margin: 12,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  sectionIcon: {
    fontSize: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statBox: {
    flex: 1,
    minWidth: '45%',
    padding: 12,
    backgroundColor: 'rgba(0,0,0,0.03)',
    borderRadius: 8,
  },
  statLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  infoText: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 4,
  },
  timestamp: {
    fontSize: 11,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
