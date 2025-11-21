// Performance Metrics Component - Visualizes app performance data

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

import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';

import { useTheme } from '../contexts/ThemeContext';
import {
  getColdStartHistory,
  getColdStartStats,
  getStorageMetrics,
} from '../utils/metricsCollector';

export default function PerformanceMetrics() {
  const { colors } = useTheme();
  const [coldStartHistory, setColdStartHistory] = useState([]);
  const [coldStartStats, setColdStartStats] = useState(null);
  const [storageMetrics, setStorageMetrics] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadData = async () => {
    const history = await getColdStartHistory();
    const stats = await getColdStartStats();
    const storage = await getStorageMetrics();

    setColdStartHistory(history);
    setColdStartStats(stats);
    setStorageMetrics(storage);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadData();
    setIsRefreshing(false);
  };

  const formatDuration = (ms) => {
    if (ms >= 1000) {
      return `${(ms / 1000).toFixed(2)}s`;
    }
    return `${ms}ms`;
  };

  const formatBytes = (bytes) => {
    if (bytes >= 1024 * 1024) {
      return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    } else if (bytes >= 1024) {
      return `${(bytes / 1024).toFixed(2)} KB`;
    }
    return `${bytes} B`;
  };

  const getCategoryLabel = (key) => {
    const labels = {
      metrics: 'Metrics',
      settings: 'Settings',
      logs: 'Logs',
      favorites: 'Favorites',
      other: 'Other',
    };
    return labels[key] || key;
  };

  if (!coldStartStats || !storageMetrics) {
    return (
      <View style={[styles.container, { backgroundColor: colors.surface }]}>
        <Text style={[styles.loadingText, { color: colors.textMuted }]}>
          Loading performance metrics...
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {/* Cold Start Section */}
        <View style={[styles.section, { backgroundColor: colors.background }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionIcon, { fontSize: 24 }]}>⚡</Text>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Cold Start Performance</Text>
          </View>

          {coldStartStats.count === 0 ? (
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>
              No cold start data yet. Restart the app to record metrics!
            </Text>
          ) : (
            <>
              <View style={styles.statsGrid}>
                <View style={styles.statBox}>
                  <Text style={[styles.statLabel, { color: colors.textMuted }]}>Last Start</Text>
                  <Text style={[styles.statValue, { color: colors.primary }]}>
                    {formatDuration(coldStartStats.last)}
                  </Text>
                </View>

                <View style={styles.statBox}>
                  <Text style={[styles.statLabel, { color: colors.textMuted }]}>Average</Text>
                  <Text style={[styles.statValue, { color: colors.text }]}>
                    {formatDuration(coldStartStats.average)}
                  </Text>
                </View>

                <View style={styles.statBox}>
                  <Text style={[styles.statLabel, { color: colors.textMuted }]}>Fastest</Text>
                  <Text style={[styles.statValue, { color: '#4caf50' }]}>
                    {formatDuration(coldStartStats.min)}
                  </Text>
                </View>

                <View style={styles.statBox}>
                  <Text style={[styles.statLabel, { color: colors.textMuted }]}>Slowest</Text>
                  <Text style={[styles.statValue, { color: '#ff9800' }]}>
                    {formatDuration(coldStartStats.max)}
                  </Text>
                </View>
              </View>

              {/* Recent Cold Starts */}
              <View style={styles.historySection}>
                <Text style={[styles.subsectionTitle, { color: colors.textMuted }]}>
                  Recent Starts ({coldStartStats.count} recorded)
                </Text>
                {coldStartHistory.slice().reverse().map((event, index) => (
                  <View
                    key={`${event.timestamp}-${index}`}
                    style={[styles.historyItem, { borderBottomColor: colors.border }]}
                  >
                    <Text style={[styles.historyDuration, { color: colors.text }]}>
                      {formatDuration(event.duration)}
                    </Text>
                    <Text style={[styles.historyTimestamp, { color: colors.textMuted }]}>
                      {new Date(event.timestamp).toLocaleString()}
                    </Text>
                  </View>
                ))}
              </View>
            </>
          )}
        </View>

        {/* Storage Section */}
        <View style={[styles.section, { backgroundColor: colors.background }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionIcon, { fontSize: 24 }]}>💾</Text>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Storage Metrics</Text>
          </View>

          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>Total Size</Text>
              <Text style={[styles.statValue, { color: colors.primary }]}>
                {storageMetrics.totalSizeKB} KB
              </Text>
            </View>

            <View style={styles.statBox}>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>Total Keys</Text>
              <Text style={[styles.statValue, { color: colors.text }]}>
                {storageMetrics.totalKeys}
              </Text>
            </View>
          </View>

          {/* Storage Breakdown */}
          {Object.keys(storageMetrics.breakdown).length > 0 && (
            <View style={styles.breakdownSection}>
              <Text style={[styles.subsectionTitle, { color: colors.textMuted }]}>
                Storage Breakdown
              </Text>
              {Object.entries(storageMetrics.breakdown).map(([category, size]) => (
                <View
                  key={category}
                  style={[styles.breakdownItem, { borderBottomColor: colors.border }]}
                >
                  <Text style={[styles.breakdownLabel, { color: colors.text }]}>
                    {getCategoryLabel(category)}
                  </Text>
                  <Text style={[styles.breakdownValue, { color: colors.textMuted }]}>
                    {formatBytes(size)}
                  </Text>
                </View>
              ))}
            </View>
          )}
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
  loadingText: {
    textAlign: 'center',
    padding: 20,
    fontSize: 14,
  },
  emptyText: {
    textAlign: 'center',
    padding: 12,
    fontSize: 13,
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
  subsectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
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
  historySection: {
    marginTop: 8,
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  historyDuration: {
    fontSize: 15,
    fontWeight: '600',
  },
  historyTimestamp: {
    fontSize: 11,
    fontStyle: 'italic',
  },
  breakdownSection: {
    marginTop: 8,
  },
  breakdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  breakdownLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  breakdownValue: {
    fontSize: 13,
  },
});
