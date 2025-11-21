// App State History Component - Visualizes app state transitions

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
  getAppStateHistory,
  getAppStateStats,
  getStateTimeBreakdown,
} from '../utils/metricsCollector';

export default function AppStateHistory() {
  const { colors } = useTheme();
  const [events, setEvents] = useState([]);
  const [stats, setStats] = useState(null);
  const [timeBreakdown, setTimeBreakdown] = useState({});
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadData = async () => {
    const history = await getAppStateHistory();
    const statistics = await getAppStateStats();
    const breakdown = await getStateTimeBreakdown();

    setEvents(history);
    setStats(statistics);
    setTimeBreakdown(breakdown);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadData();
    setIsRefreshing(false);
  };

  const getStateColor = (state) => {
    switch (state) {
      case 'active':
        return '#4caf50'; // Green
      case 'background':
        return '#ff9800'; // Orange
      case 'inactive':
        return '#9e9e9e'; // Gray
      default:
        return colors.text;
    }
  };

  const getStateIcon = (state) => {
    switch (state) {
      case 'active':
        return '▶️';
      case 'background':
        return '⏸️';
      case 'inactive':
        return '⏹️';
      default:
        return '❓';
    }
  };

  const formatDuration = (ms) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
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
          Loading app state history...
        </Text>
      </View>
    );
  }

  if (events.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.surface }]}>
        <Text style={[styles.emptyText, { color: colors.textMuted }]}>
          No app state data yet. Use the app for a while and check back!
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
        {/* Stats Section */}
        <View style={[styles.section, { backgroundColor: colors.background }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionIcon, { fontSize: 24 }]}>📊</Text>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Overview</Text>
          </View>

          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>Total Transitions</Text>
              <Text style={[styles.statValue, { color: colors.text }]}>{stats.totalTransitions}</Text>
            </View>

            <View style={styles.statBox}>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>Current State</Text>
              <View style={styles.statValueRow}>
                <Text style={styles.stateIcon}>{getStateIcon(stats.lastState)}</Text>
                <Text style={[styles.statValue, { color: getStateColor(stats.lastState) }]}>
                  {stats.lastState}
                </Text>
              </View>
            </View>
          </View>

          {/* Time Breakdown */}
          {Object.keys(timeBreakdown).length > 0 && (
            <View style={styles.breakdownSection}>
              <Text style={[styles.subsectionTitle, { color: colors.textMuted }]}>
                Time Spent
              </Text>
              {Object.entries(timeBreakdown).map(([state, duration]) => (
                <View
                  key={state}
                  style={styles.breakdownItem}
                >
                  <View style={styles.breakdownLeft}>
                    <Text style={styles.stateIcon}>{getStateIcon(state)}</Text>
                    <Text style={[styles.breakdownLabel, { color: colors.text }]}>
                      {state}
                    </Text>
                  </View>
                  <Text style={[styles.breakdownValue, { color: colors.textMuted }]}>
                    {formatDuration(duration)}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Event Timeline Section */}
        <View style={[styles.section, { backgroundColor: colors.background }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionIcon, { fontSize: 24 }]}>📅</Text>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Event Timeline</Text>
          </View>
        {events.slice().reverse().map((event, index) => {
          const actualIndex = events.length - 1 - index;
          const nextEvent = actualIndex < events.length - 1 ? events[actualIndex + 1] : null;
          const duration = nextEvent
            ? new Date(nextEvent.timestamp) - new Date(event.timestamp)
            : null;

          return (
            <View
              key={`${event.timestamp}-${actualIndex}`}
              style={[
                styles.eventEntry,
                { borderLeftColor: getStateColor(event.state) }
              ]}
            >
              <View style={styles.eventHeader}>
                <View style={styles.eventHeaderLeft}>
                  <Text style={styles.stateIcon}>{getStateIcon(event.state)}</Text>
                  <Text style={[styles.stateName, { color: getStateColor(event.state) }]}>
                    {event.state}
                  </Text>
                </View>
                <Text style={[styles.timeAgo, { color: colors.textMuted }]}>
                  {formatTimeAgo(event.timestamp)}
                </Text>
              </View>

              {duration !== null && (
                <Text style={[styles.duration, { color: colors.textMuted }]}>
                  Duration: {formatDuration(duration)}
                </Text>
              )}

              <Text style={[styles.timestamp, { color: colors.textMuted }]}>
                {new Date(event.timestamp).toLocaleString()}
              </Text>
            </View>
          );
        })}
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
  statValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  stateIcon: {
    fontSize: 16,
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
    borderBottomColor: '#e0e0e0',
  },
  breakdownLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  breakdownLabel: {
    fontSize: 14,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  breakdownValue: {
    fontSize: 13,
  },
  eventEntry: {
    padding: 12,
    borderLeftWidth: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  eventHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stateName: {
    fontSize: 15,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  timeAgo: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  duration: {
    fontSize: 12,
    marginBottom: 4,
  },
  timestamp: {
    fontSize: 11,
    fontStyle: 'italic',
  },
});
