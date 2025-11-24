import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useSystemMetrics } from './useSystemMetrics';

export const SystemMetricsDisplay: React.FC = () => {
  const { metrics, loading, error, refresh } = useSystemMetrics({
    autoRefresh: true,
    refreshInterval: 5000, // Update every 5 seconds
  });

  if (loading && !metrics) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Error: {error.message}</Text>
      </View>
    );
  }

  if (!metrics) {
    return (
      <View style={styles.centerContainer}>
        <Text>No metrics available</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={refresh} />
      }
    >
      {/* Memory Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Memory</Text>
        <MetricRow
          label="Used"
          value={`${metrics.memory.used.toFixed(1)} MB`}
        />
        <MetricRow
          label="Total"
          value={`${metrics.memory.total.toFixed(1)} MB`}
        />
        <MetricRow
          label="Usage"
          value={`${((metrics.memory.used / metrics.memory.total) * 100).toFixed(1)}%`}
        />
      </View>

      {/* CPU Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>CPU</Text>
        <MetricRow
          label="Usage"
          value={`${metrics.cpu.usage.toFixed(1)}%`}
        />
        <MetricRow
          label="Thread Count"
          value={metrics.cpu.threadCount.toString()}
        />
      </View>

      {/* Threads Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Threads</Text>
        <MetricRow
          label="Active Threads"
          value={metrics.threads.toString()}
        />
      </View>

      {/* Battery Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Battery</Text>
        <MetricRow
          label="Level"
          value={metrics.battery.level >= 0 ? `${metrics.battery.level.toFixed(1)}%` : 'Unknown'}
        />
        <MetricRow
          label="State"
          value={metrics.battery.state}
        />
        <MetricRow
          label="Charging"
          value={metrics.battery.isCharging ? 'Yes' : 'No'}
        />
      </View>

      {/* Disk Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Disk</Text>
        <MetricRow
          label="Used"
          value={`${metrics.disk.used.toFixed(2)} GB`}
        />
        <MetricRow
          label="Free"
          value={`${metrics.disk.free.toFixed(2)} GB`}
        />
        <MetricRow
          label="Total"
          value={`${metrics.disk.total.toFixed(2)} GB`}
        />
        <MetricRow
          label="Usage"
          value={`${((metrics.disk.used / metrics.disk.total) * 100).toFixed(1)}%`}
        />
      </View>

      {/* Timestamp */}
      <View style={styles.section}>
        <Text style={styles.timestamp}>
          Last updated: {new Date(metrics.timestamp * 1000).toLocaleTimeString()}
        </Text>
      </View>
    </ScrollView>
  );
};

interface MetricRowProps {
  label: string;
  value: string;
}

const MetricRow: React.FC<MetricRowProps> = ({ label, value }) => (
  <View style={styles.metricRow}>
    <Text style={styles.metricLabel}>{label}:</Text>
    <Text style={styles.metricValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    backgroundColor: 'white',
    marginVertical: 8,
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  metricLabel: {
    fontSize: 14,
    color: '#666',
  },
  metricValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
  },
  timestamp: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
});
