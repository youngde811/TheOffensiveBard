// -*- mode: rjsx; eval: (auto-fill-mode 1); -*-

// This file contains the Debug screen for widget sync troubleshooting.

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

import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';

import { useTheme } from '../contexts/ThemeContext';
import { debugLogger } from '../utils/debugLogger';
import { syncInsultDatabaseWithWidget } from '../utils/widgetDataShare';
import PressableOpacity from './PressableOpacity';

const allInsults = require('../../assets/data/insults-10k.json');

export default function DebugScreen({ setDismiss }) {
  const { colors } = useTheme();
  const [logs, setLogs] = useState([]);
  const [isSyncing, setIsSyncing] = useState(false);

  // Refresh logs every five seconds (now includes widget logs)
  useEffect(() => {
    const loadLogs = async () => {
      const allLogs = await debugLogger.getAllLogs();

      setLogs(allLogs);
    };

    const interval = setInterval(loadLogs, 5000);

    // Initial load
    loadLogs();

    return () => clearInterval(interval);
  }, []);

  const handleManualSync = useCallback(async () => {
    setIsSyncing(true);
    
    debugLogger.info('Manual sync triggered from debug screen');

    try {
      await syncInsultDatabaseWithWidget(allInsults.insults);
    } catch (error) {
      debugLogger.error('Manual sync failed: ' + error);
    } finally {
      setIsSyncing(false);
    }
  }, []);

  const handleCopyLogs = useCallback(async () => {
    const logsText = await debugLogger.getAllLogsAsText();
    await Clipboard.setStringAsync(logsText);

    debugLogger.success('Logs copied to clipboard');

    Alert.alert('Copied', 'Logs copied to clipboard');
  }, []);

  const handleClearLogs = useCallback(async () => {
    await debugLogger.clearAllLogs();

    setLogs([]);

    debugLogger.info('Logs cleared');
  }, []);

  const getLogColor = (type) => {
    switch (type) {
      case 'error':
        return '#e74c3c';
      case 'success':
        return '#27ae60';
      case 'info':
      default:
        return colors.text;
    }
  };

  const getSourceBadgeColor = (source) => {
    // Use theme-aware colors
    return source === 'widget' ? colors.accent || '#9b59b6' : colors.primary || '#3498db';
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="auto" />

        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.surface }]}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Widget Debug Console</Text>
          <Text style={[styles.headerSubtitle, { color: colors.textMuted }]}>
            Troubleshoot widget sync issues and view app + widget logs
          </Text>
          <Text style={[styles.logCount, { color: colors.textMuted }]}>
            {logs.length} log entries (app + widget)
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={[styles.buttonRow, { backgroundColor: colors.surface }]}>
          <PressableOpacity
            style={[styles.button, { backgroundColor: colors.primary }]}
            onPress={handleManualSync}
            disabled={isSyncing}
          >
            <Ionicons name="sync" size={20} color="white" />
            <Text style={styles.buttonText}>
              {isSyncing ? 'Syncing...' : 'Manual Sync'}
            </Text>
          </PressableOpacity>

          <PressableOpacity
            style={[styles.button, { backgroundColor: '#3498db' }]}
            onPress={handleCopyLogs}
          >
            <Ionicons name="copy" size={20} color="white" />
            <Text style={styles.buttonText}>Copy Logs</Text>
          </PressableOpacity>

          <PressableOpacity
            style={[styles.button, { backgroundColor: '#e74c3c' }]}
            onPress={handleClearLogs}
          >
            <Ionicons name="trash" size={20} color="white" />
            <Text style={styles.buttonText}>Clear</Text>
          </PressableOpacity>
        </View>

        {/* Logs Display */}
        <ScrollView
          style={[styles.logsContainer, { backgroundColor: colors.surface }]}
          contentContainerStyle={styles.logsContent}
        >
          {logs.length === 0 ? (
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>
              No logs yet. Trigger a manual sync or open the app to see logs.
            </Text>
          ) : (
            logs.map((log, index) => (
              <View key={index} style={styles.logEntry}>
                <View style={styles.logHeader}>
                  <Text style={[styles.logTimestamp, { color: colors.textMuted }]}>
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </Text>
                  <View style={[styles.sourceBadge, { backgroundColor: getSourceBadgeColor(log.source) }]}>
                    <Text style={styles.sourceBadgeText}>
                      {log.source === 'widget' ? '📱 WIDGET' : '📲 APP'}
                    </Text>
                  </View>
                </View>
                <Text style={[styles.logMessage, { color: getLogColor(log.type) }]}>
                  [{log.type.toUpperCase()}] {log.message}
                </Text>
              </View>
            ))
          )}
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <PressableOpacity
            style={[styles.dismissButton, { backgroundColor: colors.primary }]}
            onPress={setDismiss}
          >
            <Text style={styles.dismissButtonText}>Done</Text>
          </PressableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 13,
    marginBottom: 4,
  },
  logCount: {
    fontSize: 12,
    fontWeight: '600',
  },
  buttonRow: {
    flexDirection: 'row',
    padding: 12,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderRadius: 8,
    gap: 6,
  },
  buttonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  logsContainer: {
    flex: 1,
  },
  logsContent: {
    padding: 12,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 14,
    marginTop: 40,
    fontStyle: 'italic',
  },
  logEntry: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  logTimestamp: {
    fontSize: 11,
  },
  sourceBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  sourceBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '700',
  },
  logMessage: {
    fontSize: 13,
    lineHeight: 18,
    fontFamily: 'monospace',
  },
  footer: {
    padding: 16,
    paddingBottom: 20,
  },
  dismissButton: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  dismissButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
  },
});
