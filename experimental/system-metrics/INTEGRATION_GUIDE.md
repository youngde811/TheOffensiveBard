# iOS System Metrics Integration Guide

## Files Overview

1. **SystemMetrics.swift** - Native Swift module
2. **SystemMetrics.m** - Objective-C bridge
3. **SystemMetrics.types.ts** - TypeScript type definitions
4. **SystemMetricsAPI.ts** - React Native JavaScript interface
5. **useSystemMetrics.ts** - React hook for easy integration
6. **SystemMetricsDisplay.tsx** - Example component

## Installation Steps

### 1. Add Native Files to Your iOS Project

In Xcode, add these files to your project:

```
YourProject/
├── ios/
│   └── YourProject/
│       ├── SystemMetrics.swift
│       └── SystemMetrics.m
```

**Important:** When adding `SystemMetrics.swift`, Xcode will ask if you want to create a bridging header. Click "Create Bridging Header" if you don't already have one.

### 2. Configure Bridging Header (if needed)

If Xcode created a bridging header (`YourProject-Bridging-Header.h`), ensure it includes:

```objc
#import <React/RCTBridgeModule.h>
```

### 3. Add TypeScript Files to Your React Native Project

Place these files in your React Native source directory:

```
src/
├── modules/
│   └── metrics/
│       ├── SystemMetrics.types.ts
│       ├── SystemMetricsAPI.ts
│       ├── useSystemMetrics.ts
│       └── SystemMetricsDisplay.tsx
```

### 4. Rebuild Your iOS App

```bash
cd ios
pod install
cd ..
npx react-native run-ios
```

## Usage Examples

### Basic Usage - Single Fetch

```typescript
import SystemMetricsAPI from './modules/metrics/SystemMetricsAPI';

// Get metrics once
const metrics = await SystemMetricsAPI.getMetrics();
console.log('Memory used:', metrics.memory.used, 'MB');
console.log('CPU usage:', metrics.cpu.usage, '%');
console.log('Threads:', metrics.threads);
console.log('Battery:', metrics.battery.level, '%');
console.log('Disk used:', metrics.disk.used, 'GB');
```

### Using the React Hook

```typescript
import { useSystemMetrics } from './modules/metrics/useSystemMetrics';

function MyComponent() {
  const { metrics, loading, error, refresh } = useSystemMetrics({
    autoRefresh: true,
    refreshInterval: 5000, // Update every 5 seconds
  });

  if (loading) return <Text>Loading...</Text>;
  if (error) return <Text>Error: {error.message}</Text>;
  
  return (
    <View>
      <Text>Memory: {metrics.memory.used.toFixed(1)} MB</Text>
      <Text>CPU: {metrics.cpu.usage.toFixed(1)}%</Text>
      <Button title="Refresh" onPress={refresh} />
    </View>
  );
}
```

### Using the Pre-built Display Component

```typescript
import { SystemMetricsDisplay } from './modules/metrics/SystemMetricsDisplay';

function App() {
  return <SystemMetricsDisplay />;
}
```

## Metrics Returned

### Memory
- `used` (MB) - Current app memory usage
- `total` (MB) - Total device memory
- `usedBytes` - Raw byte count
- `totalBytes` - Raw byte count

### CPU
- `usage` (%) - Current CPU usage (can exceed 100% on multi-core)
- `threadCount` - Number of active threads

### Threads
- Integer count of active threads

### Battery
- `level` (%) - Battery percentage (0-100, or -1 if unavailable)
- `state` - "unplugged", "charging", "full", or "unknown"
- `isCharging` - Boolean

### Disk
- `used` (GB) - Used disk space
- `free` (GB) - Free disk space
- `total` (GB) - Total disk space
- `usedBytes`, `freeBytes`, `totalBytes` - Raw byte counts

### Timestamp
- Unix timestamp of when metrics were collected

## Advanced Usage

### Custom Refresh Intervals

```typescript
// Update every second for intensive monitoring
const { metrics } = useSystemMetrics({
  autoRefresh: true,
  refreshInterval: 1000,
});
```

### Manual Refresh Only

```typescript
// No auto-refresh, manual control
const { metrics, refresh } = useSystemMetrics({
  autoRefresh: false,
});

// Call refresh() when needed
```

### Error Handling

```typescript
const { metrics, error } = useSystemMetrics();

if (error) {
  // Handle error appropriately
  console.error('Metrics error:', error);
}
```

## Performance Considerations

- CPU metrics have minimal overhead (~0.1% CPU)
- Memory metrics are very lightweight
- Battery monitoring is enabled automatically
- Disk metrics involve file system calls (slightly heavier)
- Recommended refresh interval: 5-10 seconds for production
- Use 1-second intervals only for debugging

## Troubleshooting

### Module not found
- Ensure `SystemMetrics.m` is in your Xcode project's compile sources
- Check Build Phases → Compile Sources in Xcode

### Swift bridging issues
- Verify bridging header includes `#import <React/RCTBridgeModule.h>`
- Check Build Settings → Objective-C Bridging Header path

### TypeScript errors
- Run `npx tsc --noEmit` to check for type errors
- Ensure all `.ts` and `.tsx` files are in your project

## Notes

- iOS only (no Android implementation provided)
- No network metrics (as requested)
- Battery monitoring is enabled when metrics are fetched
- Disk metrics measure device storage, not app storage specifically
- CPU usage can exceed 100% on multi-core devices (represents total across all cores)
