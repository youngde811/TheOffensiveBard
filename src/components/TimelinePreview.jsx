// Timeline Preview Component - Visualizes the widget's 48-hour timeline

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
import { getWidgetTimeline, getTimelineStats } from '../utils/widgetTimelineReader';

export default function TimelinePreview() {
  const { colors } = useTheme();
  const [timeline, setTimeline] = useState([]);
  const [stats, setStats] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadTimeline = async () => {
    const timelineData = await getWidgetTimeline();
    const statsData = await getTimelineStats();

    setTimeline(timelineData);
    setStats(statsData);
  };

  useEffect(() => {
    loadTimeline();
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadTimeline();
    setIsRefreshing(false);
  };

  const getStatusColor = (entry) => {
    if (entry.isCurrent) return colors.primary || '#5f9ea0';
    if (entry.isPast) return colors.textMuted || '#999';
    return colors.text || '#333';
  };

  const getStatusLabel = (entry) => {
    if (entry.isCurrent) return 'CURRENT';
    if (entry.isPast) return 'PAST';
    return 'FUTURE';
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = date - now;
    const diffHours = Math.round(diffMs / (1000 * 60 * 60));

    if (diffHours === 0) return 'Now';
    if (diffHours > 0) return `+${diffHours}h`;
    return `${diffHours}h`;
  };

  if (!stats) {
    return (
      <View style={[styles.container, { backgroundColor: colors.surface }]}>
        <Text style={[styles.loadingText, { color: colors.textMuted }]}>
          Loading timeline...
        </Text>
      </View>
    );
  }

  if (timeline.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.surface }]}>
        <Text style={[styles.emptyText, { color: colors.textMuted }]}>
          No timeline data available. Open the app to sync widget data.
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      {/* Stats Header */}
      <View style={[styles.statsCard, { backgroundColor: colors.background }]}>
        <View style={styles.statRow}>
          <Text style={[styles.statLabel, { color: colors.textMuted }]}>Total Insults:</Text>
          <Text style={[styles.statValue, { color: colors.text }]}>{stats.totalInsults}</Text>
        </View>
        <View style={styles.statRow}>
          <Text style={[styles.statLabel, { color: colors.textMuted }]}>Timeline Length:</Text>
          <Text style={[styles.statValue, { color: colors.text }]}>{stats.timelineLength} hours</Text>
        </View>
        {stats.syncedAt && (
          <View style={styles.statRow}>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>Last Synced:</Text>
            <Text style={[styles.statValue, { color: colors.text }]}>
              {new Date(stats.syncedAt).toLocaleString()}
            </Text>
          </View>
        )}
      </View>

      {/* Timeline List */}
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
        {timeline.map((entry) => (
          <View
            key={entry.index}
            style={[
              styles.timelineEntry,
              { borderLeftColor: getStatusColor(entry) }
            ]}
          >
            <View style={styles.entryHeader}>
              <View style={styles.entryHeaderLeft}>
                <Text style={[styles.entryIndex, { color: colors.textMuted }]}>
                  #{entry.index + 1}
                </Text>
                <Text style={[styles.entryTime, { color: getStatusColor(entry) }]}>
                  {formatTimestamp(entry.timestamp)}
                </Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(entry) }]}>
                <Text style={styles.statusText}>{getStatusLabel(entry)}</Text>
              </View>
            </View>
            <Text
              style={[styles.insultText, { color: colors.text }]}
              numberOfLines={2}
            >
              {entry.insult}
            </Text>
            <Text style={[styles.timestamp, { color: colors.textMuted }]}>
              {new Date(entry.timestamp).toLocaleString()}
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  statsCard: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 14,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingBottom: 20,
  },
  timelineEntry: {
    padding: 12,
    borderLeftWidth: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  entryHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  entryIndex: {
    fontSize: 12,
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  entryTime: {
    fontSize: 13,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  statusText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '700',
  },
  insultText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 6,
  },
  timestamp: {
    fontSize: 11,
    fontStyle: 'italic',
  },
});
