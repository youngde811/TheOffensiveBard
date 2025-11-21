# App Metrics Feature Specification

## Overview
Add an "App Metrics" screen to visualize system-level metrics and performance data. This combines the whimsical nature of the app with solid engineering visibility for fun technical insights.

## Screen Structure

### 1. System Integration Section

#### App State History
- **Visualization**: Timeline graph showing app state transitions
- **States**: Foreground, Background, Suspended, Inactive
- **Data**: Timestamp, state, duration
- **Display**: Last 24 hours of transitions with color-coded bars
- **Storage**: AsyncStorage, keep last 100 transitions

#### Background Refresh Stats
- **Metrics**:
  - Total background refresh events
  - Success rate percentage
  - Average duration
  - Last refresh timestamp
- **Visualization**: Bar chart of refresh frequency over time
- **Data Source**: iOS background refresh events

#### Battery Impact
- **Metrics**:
  - Energy impact level (low/medium/high)
  - Chart over time if available
- **Note**: May need to check iOS API availability

#### Widget Budget Usage
- **Metrics**:
  - iOS widget time budget consumption
  - Number of widget updates per day
  - Average update duration
- **Visualization**: Progress bar or gauge showing budget usage

### 2. Widget Performance Section

#### Timeline Generation Metrics
- **Metrics**:
  - Average generation time
  - Min/max generation time
  - Last 10 generation times
- **Visualization**: Line chart or histogram
- **Data Source**: Instrument InsultProvider.generateTimelineEntries()

#### Widget Reload Frequency
- **Metrics**:
  - Reload events per hour/day
  - Time between reloads
- **Visualization**: Timeline chart showing when iOS requests updates
- **Data Source**: Widget logs

#### Active Widget Count
- **Display**: Number of home screen widget instances
- **Note**: May need to track via widget requests or estimate

#### Timeline Preview Graph
- **Visualization**: Interactive list/graph of next 48 insult entries
- **Display**: Timestamp, insult preview (first 50 chars), entry number
- **Color coding**: Past entries (gray), current (green), future (blue)
- **Data Source**: Read from shared UserDefaults insultDatabase

### 3. App Performance Section

#### Cold Start Time
- **Metrics**:
  - Last 10 cold start times
  - Average cold start time
- **Visualization**: Line chart
- **Data Source**: Measure from App.js mount to first render

#### Storage Metrics
- **Metrics**:
  - AsyncStorage size (KB/MB)
  - SharedGroupPreferences read/write latency (ms)
  - Number of stored keys
- **Visualization**: Simple stats display

#### Memory Usage
- **Metrics**:
  - Current app memory footprint (MB)
  - Peak memory usage
- **Visualization**: Gauge or simple display

### 4. Log Statistics Section

#### Error Rate
- **Metrics**:
  - Errors per hour
  - Errors per day
  - Total errors in log history
- **Visualization**: Line chart over time

#### Log Volume by Source
- **Metrics**:
  - App logs count
  - Widget logs count
- **Visualization**: Pie chart or bar chart

#### Top Log Types
- **Metrics**:
  - Distribution: error, warning, success, info, debug
- **Visualization**: Pie chart or stacked bar

## Implementation Priority

### Phase 1: Visualizations (Start Here!)
1. **Timeline Preview Graph** - Most visual, uses existing widget data
2. **App State History** - Track and visualize state transitions

### Phase 2: Widget Metrics
3. Timeline generation timing
4. Widget reload frequency from logs

### Phase 3: Performance & Statistics
5. Cold start tracking
6. Log statistics
7. Storage metrics

### Phase 4: Advanced (Future)
8. Background refresh tracking
9. Battery impact (if API available)
10. Widget budget tracking

## Technical Architecture

### Metrics Collection Service
- **Location**: `src/utils/metricsCollector.js`
- **Features**:
  - Track app state changes
  - Measure timing for key operations
  - Store metrics in AsyncStorage
  - Provide query methods for charts

### Storage Strategy
- **Key Prefix**: `@insolentbard:metrics:`
- **Data Structure**: Time-series events stored as JSON arrays
- **Retention**: Configurable (default: last 100 events or 7 days)
- **Cleanup**: Auto-prune old data on app start

### UI Components
- **Location**: `src/components/metrics/`
- **Charts**: Use react-native-chart-kit or react-native-svg for visualizations
- **Refresh**: Pull-to-refresh for live updates
- **Export**: Copy metrics to clipboard (JSON format)

## User Experience

### Navigation
- Add "App Metrics" to main drawer (below Settings)
- Icon: 📊 or chart icon

### Screen Layout
- Scrollable sections
- Collapsible cards for each metric category
- "Last Updated" timestamp in header
- Refresh button in header

### Settings Integration
- Option to disable metrics collection (privacy)
- Option to clear all metrics data
- Export metrics as JSON

## Fun Additions

### Easter Eggs
- If error rate is 0, show "Thou art most competent!"
- If app uptime > 1 hour, show Shakespearean praise
- Timeline visualization could have playful labels

### Sharing
- Screenshot metrics for social media
- Generate "App Health Report" in Shakespearean language

## Notes
- Keep metrics collection lightweight (no performance impact)
- All metrics are local (no telemetry/analytics)
- User can disable/clear at any time
- Make it fun and educational!

## Future Ideas
- Compare metrics before/after app updates
- Widget "personality" - track which insults are shown most
- Network request timing (if we add API calls later)
- Crash reporting visualization
