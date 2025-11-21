// Log Statistics Component - Analyzes and visualizes log data

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
import { debugLogger } from '../utils/debugLogger';

export default function LogStatistics() {
  const { colors } = useTheme();
  const [stats, setStats] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadStats = async () => {
    const allLogs = await debugLogger.getAllLogs();

    if (allLogs.length === 0) {
      setStats({
        total: 0,
        byType: {},
        bySource: {},
        recent: [],
        errorRate: 0,
      });
      return;
    }

    // Calculate statistics
    const byType = {};
    const bySource = {};
    let errorCount = 0;

    allLogs.forEach(log => {
      // Count by type
      byType[log.type] = (byType[log.type] || 0) + 1;

      // Count by source
      bySource[log.source] = (bySource[log.source] || 0) + 1;

      // Count errors
      if (log.type === 'error') {
        errorCount++;
      }
    });

    // Get recent logs (last 10)
    const recent = allLogs.slice(-10).reverse();

    // Calculate error rate
    const errorRate = ((errorCount / allLogs.length) * 100).toFixed(1);

    setStats({
      total: allLogs.length,
      byType,
      bySource,
      recent,
      errorRate: parseFloat(errorRate),
      errorCount,
    });
  };

  useEffect(() => {
    loadStats();
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadStats();
    setIsRefreshing(false);
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'error':
        return '#f44336';
      case 'warning':
        return '#ff9800';
      case 'success':
        return '#4caf50';
      case 'info':
        return '#2196f3';
      case 'debug':
        return '#9e9e9e';
      default:
        return colors.text;
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'success':
        return '✅';
      case 'info':
        return 'ℹ️';
      case 'debug':
        return '🐛';
      default:
        return '📝';
    }
  };

  const getSourceIcon = (source) => {
    return source === 'widget' ? '📱' : '📲';
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const then = new Date(timestamp);
    const diffMs = now - then;
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffHours > 24) {
      const days = Math.floor(diffHours / 24);
      return `${days}d ago`;
    } else if (diffHours > 0) {
      return `${diffHours}h ago`;
    } else if (diffMinutes > 0) {
      return `${diffMinutes}m ago`;
    } else {
      return 'Just now';
    }
  };

  if (!stats) {
    return (
      <View style={[styles.container, { backgroundColor: colors.surface }]}>
        <Text style={[styles.loadingText, { color: colors.textMuted }]}>
          Loading log statistics...
        </Text>
      </View>
    );
  }

  if (stats.total === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.surface }]}>
        <Text style={[styles.emptyText, { color: colors.textMuted }]}>
          No log data yet. Use the app to generate logs!
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
        {/* Overview Section */}
        <View style={[styles.section, { backgroundColor: colors.background }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionIcon, { fontSize: 24 }]}>📊</Text>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Log Overview</Text>
          </View>

          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>Total Logs</Text>
              <Text style={[styles.statValue, { color: colors.primary }]}>
                {stats.total}
              </Text>
            </View>

            <View style={styles.statBox}>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>Error Rate</Text>
              <Text style={[styles.statValue, { color: stats.errorRate > 5 ? '#f44336' : '#4caf50' }]}>
                {stats.errorRate}%
              </Text>
            </View>

            <View style={styles.statBox}>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>Total Errors</Text>
              <Text style={[styles.statValue, { color: '#f44336' }]}>
                {stats.errorCount}
              </Text>
            </View>
          </View>
        </View>

        {/* Log Types Section */}
        <View style={[styles.section, { backgroundColor: colors.background }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionIcon, { fontSize: 24 }]}>🎨</Text>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>By Log Type</Text>
          </View>

          {Object.entries(stats.byType).sort((a, b) => b[1] - a[1]).map(([type, count]) => {
            const percentage = ((count / stats.total) * 100).toFixed(1);
            return (
              <View
                key={type}
                style={[styles.breakdownItem, { borderBottomColor: colors.border }]}
              >
                <View style={styles.breakdownLeft}>
                  <Text style={styles.typeIcon}>{getTypeIcon(type)}</Text>
                  <Text style={[styles.breakdownLabel, { color: getTypeColor(type) }]}>
                    {type}
                  </Text>
                </View>
                <View style={styles.breakdownRight}>
                  <Text style={[styles.breakdownCount, { color: colors.text }]}>
                    {count}
                  </Text>
                  <Text style={[styles.breakdownPercentage, { color: colors.textMuted }]}>
                    ({percentage}%)
                  </Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* Log Sources Section */}
        <View style={[styles.section, { backgroundColor: colors.background }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionIcon, { fontSize: 24 }]}>📍</Text>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>By Source</Text>
          </View>

          {Object.entries(stats.bySource).sort((a, b) => b[1] - a[1]).map(([source, count]) => {
            const percentage = ((count / stats.total) * 100).toFixed(1);
            return (
              <View
                key={source}
                style={[styles.breakdownItem, { borderBottomColor: colors.border }]}
              >
                <View style={styles.breakdownLeft}>
                  <Text style={styles.typeIcon}>{getSourceIcon(source)}</Text>
                  <Text style={[styles.breakdownLabel, { color: colors.text }]}>
                    {source === 'widget' ? 'Widget' : 'App'}
                  </Text>
                </View>
                <View style={styles.breakdownRight}>
                  <Text style={[styles.breakdownCount, { color: colors.text }]}>
                    {count}
                  </Text>
                  <Text style={[styles.breakdownPercentage, { color: colors.textMuted }]}>
                    ({percentage}%)
                  </Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* Recent Logs Section */}
        <View style={[styles.section, { backgroundColor: colors.background }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionIcon, { fontSize: 24 }]}>🕒</Text>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Logs</Text>
          </View>

          {stats.recent.map((log, index) => (
            <View
              key={`${log.timestamp}-${index}`}
              style={[styles.logItem, { borderLeftColor: getTypeColor(log.type) }]}
            >
              <View style={styles.logHeader}>
                <View style={styles.logHeaderLeft}>
                  <Text style={styles.typeIcon}>{getTypeIcon(log.type)}</Text>
                  <Text style={[styles.logType, { color: getTypeColor(log.type) }]}>
                    {log.type}
                  </Text>
                  <Text style={styles.typeIcon}>{getSourceIcon(log.source)}</Text>
                </View>
                <Text style={[styles.logTime, { color: colors.textMuted }]}>
                  {formatTimeAgo(log.timestamp)}
                </Text>
              </View>
              <Text
                style={[styles.logMessage, { color: colors.text }]}
                numberOfLines={2}
              >
                {log.message}
              </Text>
            </View>
          ))}
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
  emptyText: {
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
    minWidth: '30%',
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
  breakdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  breakdownLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  breakdownRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  breakdownLabel: {
    fontSize: 15,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  breakdownCount: {
    fontSize: 16,
    fontWeight: '700',
  },
  breakdownPercentage: {
    fontSize: 12,
  },
  typeIcon: {
    fontSize: 16,
  },
  logItem: {
    padding: 10,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderRadius: 4,
    backgroundColor: 'rgba(0,0,0,0.02)',
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  logHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  logType: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  logTime: {
    fontSize: 11,
    fontStyle: 'italic',
  },
  logMessage: {
    fontSize: 13,
    lineHeight: 18,
  },
});
