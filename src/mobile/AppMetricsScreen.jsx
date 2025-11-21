// App Metrics Screen - System-level metrics and visualizations

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

import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { useTheme } from '../contexts/ThemeContext';
import PressableOpacity from './PressableOpacity';
import InsultsHeader from './InsultsHeader';
import TimelinePreview from '../components/TimelinePreview';
import AppStateHistory from '../components/AppStateHistory';
import PerformanceMetrics from '../components/PerformanceMetrics';
import LogStatistics from '../components/LogStatistics';

export default function AppMetricsScreen({ appConfig, setDismiss }) {
  const { colors } = useTheme();
  const [activeSection, setActiveSection] = useState('timeline');

  const sections = [
    { id: 'timeline', label: 'Widget Timeline', icon: '📈' },
    { id: 'state', label: 'App State', icon: '🔄' },
    { id: 'performance', label: 'Performance', icon: '⚡' },
    { id: 'logs', label: 'Log Stats', icon: '📊' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <SafeAreaView style={styles.safeArea} edges={['bottom', 'left', 'right']}>
        <StatusBar style="auto" />

        {/* Header */}
        <View style={{ zIndex: 1000, elevation: 10, marginTop: 4 }}>
          <InsultsHeader appConfig={appConfig} />
        </View>

        {/* Page Title */}
        <View style={[styles.titleBar, { backgroundColor: colors.surface }]}>
          <Text style={[styles.title, { color: colors.text }]}>📊 App Metrics</Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>
            System visualizations and technical insights
          </Text>
        </View>

        {/* Section Tabs */}
        <ScrollView
          horizontal
          style={[styles.tabBar, { backgroundColor: colors.surface }]}
          contentContainerStyle={styles.tabBarContent}
          showsHorizontalScrollIndicator={false}
        >
          {sections.map((section) => (
            <PressableOpacity
              key={section.id}
              style={[
                styles.tab,
                activeSection === section.id && styles.tabActive,
                activeSection === section.id && { backgroundColor: colors.primary }
              ]}
              onPress={() => !section.comingSoon && setActiveSection(section.id)}
            >
              <Text style={styles.tabIcon}>{section.icon}</Text>
              <Text
                style={[
                  styles.tabLabel,
                  activeSection === section.id && styles.tabLabelActive,
                  { color: activeSection === section.id ? 'white' : colors.text }
                ]}
              >
                {section.label}
              </Text>
              {section.comingSoon && (
                <Text style={[styles.comingSoonBadge, { color: colors.textMuted }]}>
                  Soon
                </Text>
              )}
            </PressableOpacity>
          ))}
        </ScrollView>

        {/* Content Area */}
        <View style={styles.content}>
          {activeSection === 'timeline' && <TimelinePreview />}
          {activeSection === 'state' && <AppStateHistory />}
          {activeSection === 'performance' && <PerformanceMetrics />}
          {activeSection === 'logs' && <LogStatistics />}
        </View>

        {/* Done Button */}
        <View style={styles.footer}>
          <PressableOpacity
            style={[styles.doneButton, { backgroundColor: colors.primary }]}
            onPress={setDismiss}
          >
            <Text style={styles.doneButtonText}>Done</Text>
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
  titleBar: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
  },
  tabBar: {
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tabBarContent: {
    padding: 12,
    gap: 8,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 6,
    backgroundColor: '#f5f5f5',
  },
  tabActive: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  tabIcon: {
    fontSize: 16,
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  tabLabelActive: {
    color: 'white',
  },
  content: {
    flex: 1,
  },
  footer: {
    padding: 16,
  },
  doneButton: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  doneButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
  },
});
