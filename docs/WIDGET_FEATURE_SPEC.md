# iOS Widget Feature Specification
## "Insult of the Day" Home Screen Widget

**Version:** 1.9.0
**Status:** Planning
**Priority:** High
**Estimated Effort:** Medium (2-3 days)

---

## Overview

Add iOS home screen and lock screen widgets that display the current "Insult of the Hour" (using the user's configured refresh interval). Users can tap the widget to open the app and share the insult.

### Visual Concept

```
┌─────────────────────────────┐
│  THE INSOLENT BARD          │
│                             │
│  "Thou art a puking,        │
│   tickle-brained            │
│   canker-blossom!"          │
│                             │
│  Updated 5 min ago          │
└─────────────────────────────┘
```

---

## User Stories

1. **As a user**, I want to see a Shakespearean insult on my home screen without opening the app
2. **As a user**, I want the widget to update at my configured interval (5, 15, 30, or 60 minutes)
3. **As a user**, I want to tap the widget to open the app and share the insult
4. **As a user**, I want the widget to match my device's light/dark mode
5. **As a user**, I want multiple widget sizes to choose from (small, medium, large)
6. **As a user (iOS 16+)**, I want a lock screen widget option

---

## Widget Sizes & Layouts

### Small Widget (2x2 grid)
- App icon or small logo
- Truncated insult (1-2 lines)
- Minimal styling

### Medium Widget (4x2 grid) - **Primary Focus**
- App title "The Insolent Bard"
- Full insult text (3-4 lines)
- "Updated X min ago" timestamp
- Parchment background
- IM Fell English font

### Large Widget (4x4 grid)
- Same as medium, but with:
  - Larger text
  - More padding
  - Optional decorative elements (quill, scroll, etc.)

### Lock Screen Widget (iOS 16+)
- Circular or rectangular format
- First few words of insult
- Minimal design (system constraints)

---

## Technical Implementation

### Prerequisites

1. **Expo SDK Support**
   - Expo 50+ has experimental widget support via config plugins
   - May need to migrate to EAS Build if not already using it
   - Check: https://docs.expo.dev/guides/widgets/

2. **App Groups** (Required for iOS widgets)
   - Widgets run in a separate process and need shared data storage
   - Must set up App Group identifier: `group.com.yourdomain.insolentbard`
   - Replace AsyncStorage with shared UserDefaults for widget data

3. **Widget Extension Target**
   - Add widget extension to Xcode project
   - Written in SwiftUI (not React Native)
   - Communicates with main app via shared container

---

## Development Steps

### Phase 1: Setup & Configuration (Day 1)

#### Step 1.1: Enable App Groups
```json
// app.json
{
  "expo": {
    "ios": {
      "appGroups": ["group.com.yourteam.insolentbard"],
      "entitlements": {
        "com.apple.security.application-groups": [
          "group.com.yourteam.insolentbard"
        ]
      }
    }
  }
}
```

#### Step 1.2: Install Dependencies
```bash
# Shared storage for App Groups
npm install react-native-shared-group-preferences

# Widget support (if using bare workflow)
npx expo install expo-dev-client
```

#### Step 1.3: Create Shared Storage Helper
**File:** `src/utils/widgetStorage.js`

```javascript
import SharedGroupPreferences from 'react-native-shared-group-preferences';

const APP_GROUP = 'group.com.yourteam.insolentbard';

export const WidgetStorage = {
  async saveInsultForWidget(insult, intervalMinutes) {
    try {
      const data = {
        insult: insult.insult || insult,
        timestamp: new Date().toISOString(),
        intervalMinutes: intervalMinutes,
      };

      await SharedGroupPreferences.setItem(
        'currentInsult',
        JSON.stringify(data),
        APP_GROUP
      );
    } catch (error) {
      console.error('Error saving insult for widget:', error);
    }
  },

  async getInsultForWidget() {
    try {
      const data = await SharedGroupPreferences.getItem('currentInsult', APP_GROUP);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error reading insult for widget:', error);
      return null;
    }
  },
};
```

#### Step 1.4: Update `useInsultOfTheHour` Hook
Modify the hook to also save to shared storage for widgets:

```javascript
// In loadInsultOfTheHour function, after setCurrentInsult:
import { WidgetStorage } from '../utils/widgetStorage';

const newInsult = selectRandomInsult();
if (newInsult) {
  await AsyncStorage.setItem(/* ... */);

  // NEW: Save for widget
  await WidgetStorage.saveInsultForWidget(
    newInsult,
    intervalMinutes
  );

  setCurrentInsult(newInsult);
}
```

---

### Phase 2: Widget Extension (Day 2)

#### Step 2.1: Create Widget Extension in Xcode

1. Open project in Xcode: `npx expo run:ios`
2. File → New → Target → Widget Extension
3. Name: `InsultWidget`
4. Language: SwiftUI
5. Include Configuration Intent: No (for now)

#### Step 2.2: Enable App Group in Widget Target

1. Select `InsultWidget` target
2. Signing & Capabilities → + Capability → App Groups
3. Check `group.com.yourteam.insolentbard`

#### Step 2.3: Create Widget SwiftUI Code

**File:** `ios/InsultWidget/InsultWidget.swift`

```swift
import WidgetKit
import SwiftUI

// MARK: - Data Model
struct InsultEntry: TimelineEntry {
    let date: Date
    let insult: String
    let timestamp: String
}

// MARK: - Timeline Provider
struct InsultProvider: TimelineProvider {
    func placeholder(in context: Context) -> InsultEntry {
        InsultEntry(
            date: Date(),
            insult: "Thou art a churlish, motley-minded knave!",
            timestamp: "Just now"
        )
    }

    func getSnapshot(in context: Context, completion: @escaping (InsultEntry) -> ()) {
        let entry = loadCurrentInsult()
        completion(entry)
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<InsultEntry>) -> ()) {
        let entry = loadCurrentInsult()

        // Refresh every 5 minutes (or based on user's interval setting)
        let nextUpdate = Calendar.current.date(byAdding: .minute, value: 5, to: Date())!
        let timeline = Timeline(entries: [entry], policy: .after(nextUpdate))

        completion(timeline)
    }

    private func loadCurrentInsult() -> InsultEntry {
        let sharedDefaults = UserDefaults(suiteName: "group.com.yourteam.insolentbard")

        if let dataString = sharedDefaults?.string(forKey: "currentInsult"),
           let data = dataString.data(using: .utf8),
           let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
           let insult = json["insult"] as? String,
           let timestampString = json["timestamp"] as? String {

            let timestamp = formatTimestamp(timestampString)

            return InsultEntry(
                date: Date(),
                insult: insult,
                timestamp: timestamp
            )
        }

        // Fallback
        return InsultEntry(
            date: Date(),
            insult: "Thou art a villainous tickle-brained canker-blossom!",
            timestamp: "Open app to refresh"
        )
    }

    private func formatTimestamp(_ isoString: String) -> String {
        let formatter = ISO8601DateFormatter()
        guard let date = formatter.date(from: isoString) else {
            return "Recently"
        }

        let interval = Date().timeIntervalSince(date)
        let minutes = Int(interval / 60)

        if minutes < 1 {
            return "Just now"
        } else if minutes == 1 {
            return "1 minute ago"
        } else if minutes < 60 {
            return "\(minutes) minutes ago"
        } else {
            let hours = minutes / 60
            return hours == 1 ? "1 hour ago" : "\(hours) hours ago"
        }
    }
}

// MARK: - Widget Views

struct SmallWidgetView: View {
    var entry: InsultEntry

    var body: some View {
        ZStack {
            // Parchment background
            Color(red: 0.95, green: 0.91, blue: 0.82)

            VStack(spacing: 4) {
                Text("🎭")
                    .font(.title2)

                Text(entry.insult)
                    .font(.system(size: 11))
                    .fontWeight(.medium)
                    .multilineTextAlignment(.center)
                    .lineLimit(3)
                    .foregroundColor(Color(red: 0.2, green: 0.2, blue: 0.2))
                    .padding(.horizontal, 8)
            }
            .padding(8)
        }
    }
}

struct MediumWidgetView: View {
    var entry: InsultEntry
    @Environment(\.colorScheme) var colorScheme

    var body: some View {
        ZStack {
            // Parchment background
            Color(red: 0.95, green: 0.91, blue: 0.82)

            VStack(alignment: .leading, spacing: 8) {
                // Title
                Text("THE INSOLENT BARD")
                    .font(.system(size: 10, weight: .bold))
                    .foregroundColor(Color(red: 0.36, green: 0.47, blue: 0.48))
                    .tracking(1.5)

                Spacer()

                // Insult text
                Text(entry.insult)
                    .font(.custom("IMFellEnglish-Regular", size: 16))
                    .fontWeight(.semibold)
                    .foregroundColor(Color(red: 0.54, green: 0.25, blue: 0.29)) // Burgundy
                    .multilineTextAlignment(.leading)
                    .lineLimit(4)
                    .lineSpacing(4)

                Spacer()

                // Timestamp
                Text(entry.timestamp)
                    .font(.system(size: 9))
                    .foregroundColor(Color.gray)
                    .opacity(0.7)
            }
            .padding(16)
        }
        .widgetURL(URL(string: "insolentbard://share-insult")!)
    }
}

struct LargeWidgetView: View {
    var entry: InsultEntry

    var body: some View {
        ZStack {
            // Parchment background with texture
            Color(red: 0.95, green: 0.91, blue: 0.82)

            VStack(alignment: .center, spacing: 12) {
                // Title with decorative elements
                HStack {
                    Text("⚔️")
                    Text("THE INSOLENT BARD")
                        .font(.system(size: 14, weight: .bold))
                        .tracking(2)
                    Text("🎭")
                }
                .foregroundColor(Color(red: 0.36, green: 0.47, blue: 0.48))

                Spacer()

                // Insult text (larger)
                Text(entry.insult)
                    .font(.custom("IMFellEnglish-Regular", size: 22))
                    .fontWeight(.bold)
                    .foregroundColor(Color(red: 0.54, green: 0.25, blue: 0.29))
                    .multilineTextAlignment(.center)
                    .lineLimit(5)
                    .lineSpacing(6)
                    .padding(.horizontal, 20)

                Spacer()

                // Timestamp
                Text(entry.timestamp)
                    .font(.system(size: 11))
                    .foregroundColor(Color.gray)
                    .opacity(0.7)
            }
            .padding(20)
        }
        .widgetURL(URL(string: "insolentbard://share-insult")!)
    }
}

// MARK: - Widget Configuration

@main
struct InsultWidget: Widget {
    let kind: String = "InsultWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: InsultProvider()) { entry in
            InsultWidgetEntryView(entry: entry)
        }
        .configurationDisplayName("Insult of the Hour")
        .description("Display a Shakespearean insult on your home screen.")
        .supportedFamilies([.systemSmall, .systemMedium, .systemLarge])
    }
}

struct InsultWidgetEntryView: View {
    @Environment(\.widgetFamily) var family
    var entry: InsultEntry

    var body: some View {
        switch family {
        case .systemSmall:
            SmallWidgetView(entry: entry)
        case .systemMedium:
            MediumWidgetView(entry: entry)
        case .systemLarge:
            LargeWidgetView(entry: entry)
        default:
            MediumWidgetView(entry: entry)
        }
    }
}

// MARK: - Preview

struct InsultWidget_Previews: PreviewProvider {
    static var previews: some View {
        InsultWidgetEntryView(entry: InsultEntry(
            date: Date(),
            insult: "Thou gleeking flap-mouthed foot-licker!",
            timestamp: "5 minutes ago"
        ))
        .previewContext(WidgetPreviewContext(family: .systemMedium))
    }
}
```

---

### Phase 3: Deep Linking & Font Setup (Day 2-3)

#### Step 3.1: Add Custom URL Scheme

**File:** `app.json`

```json
{
  "expo": {
    "ios": {
      "bundleIdentifier": "com.yourteam.insolentbard",
      "infoPlist": {
        "CFBundleURLTypes": [
          {
            "CFBundleURLSchemes": ["insolentbard"]
          }
        ]
      }
    }
  }
}
```

#### Step 3.2: Handle Deep Link in App

**File:** `App.js`

```javascript
import * as Linking from 'expo-linking';

// Inside your App component
useEffect(() => {
  const handleDeepLink = (event) => {
    const { url } = event;

    if (url.includes('share-insult')) {
      // Trigger share of current insult
      // You can navigate to main screen and auto-trigger share
    }
  };

  Linking.addEventListener('url', handleDeepLink);

  // Handle initial URL if app was closed
  Linking.getInitialURL().then((url) => {
    if (url?.includes('share-insult')) {
      // Handle share
    }
  });

  return () => {
    Linking.removeEventListener('url', handleDeepLink);
  };
}, []);
```

#### Step 3.3: Add IM Fell English Font to Widget

1. Add font file to widget target in Xcode:
   - Drag `IMFellEnglish-Regular.ttf` into `InsultWidget` folder
   - Check "Copy items if needed" and select `InsultWidget` target

2. Update `Info.plist` for widget:

```xml
<key>UIAppFonts</key>
<array>
    <string>IMFellEnglish-Regular.ttf</string>
</array>
```

---

### Phase 4: Testing & Polish (Day 3)

#### Step 4.1: Widget Refresh Testing

Test that widgets update at correct intervals:
- Background the app
- Wait for configured interval (5, 15, 30, 60 min)
- Check if widget updates
- Test with different interval settings

#### Step 4.2: Visual Testing

Test all widget sizes and modes:
- Small, Medium, Large widgets
- Light and dark mode
- Long vs short insults
- Text truncation handling

#### Step 4.3: Edge Cases

- App not opened yet (no insult data)
- App data cleared
- Device reboot
- Network issues (shouldn't affect widgets since data is local)

---

## User Settings Integration

### Add Widget Preferences to Settings Page

**File:** `src/mobile/Settings.jsx`

Add new section:

```javascript
<View style={[styles.section, { backgroundColor: colors.surface }]}>
  <Text style={[styles.sectionTitle, { color: colors.text }]}>
    Widget
  </Text>
  <Text style={[styles.sectionDescription, { color: colors.textMuted }]}>
    Your home screen widget uses the same refresh interval as the Insult of the Hour.
    Current setting: {INSULT_REFRESH_INTERVALS[insultRefreshInterval].label}
  </Text>

  <PressableOpacity
    style={[styles.linkButton, { borderColor: colors.primary }]}
    onPress={handleOpenWidgetInstructions}
  >
    <Text style={[styles.linkButtonText, { color: colors.primary }]}>
      How to Add Widget
    </Text>
  </PressableOpacity>
</View>
```

---

## Documentation Updates

### README.md

Add to Features section:
```markdown
- **Home Screen Widget** - Display the Insult of the Hour on your home screen with small, medium, or large widget sizes
```

### About Page

Add to features list:
```html
<li><strong>Home Screen Widget</strong> - Add a widget to your home screen to see fresh insults without opening the app (iOS 14+)</li>
```

Add usage tip:
```html
<li><strong>Add the widget</strong> - Long-press your home screen, tap the + button, search for "Insolent Bard", and choose your preferred size</li>
```

---

## App Store Updates

### What's New in v1.9.0

```
NEW: Home Screen Widget! 📱
• Display Shakespearean insults on your home screen
• Choose from small, medium, or large widget sizes
• Automatically updates at your configured interval
• Tap widget to open app and share the insult

Widget requires iOS 14 or later.
```

### Screenshots

Capture screenshots showing:
1. Medium widget on home screen (light mode)
2. Large widget on home screen (dark mode)
3. Widget gallery showing all three sizes
4. Lock screen widget (iOS 16+ bonus)

---

## Implementation Checklist

### Setup Phase
- [ ] Add App Group entitlement to app.json
- [ ] Install `react-native-shared-group-preferences`
- [ ] Create `widgetStorage.js` utility
- [ ] Update `useInsultOfTheHour` to save to shared storage
- [ ] Test shared storage read/write

### Widget Development
- [ ] Create Widget Extension in Xcode
- [ ] Enable App Group for widget target
- [ ] Implement SwiftUI widget views (Small, Medium, Large)
- [ ] Implement TimelineProvider
- [ ] Add IM Fell English font to widget
- [ ] Test data loading from shared container

### Integration
- [ ] Add custom URL scheme (insolentbard://)
- [ ] Implement deep link handling in App.js
- [ ] Add widget instructions to Settings page
- [ ] Update widget when user changes interval setting

### Testing
- [ ] Test all widget sizes
- [ ] Test light/dark mode
- [ ] Test widget refresh at different intervals
- [ ] Test deep link (tap widget → open app)
- [ ] Test edge cases (no data, app cleared, etc.)

### Documentation
- [ ] Update README.md
- [ ] Update about.html
- [ ] Create user instructions for adding widget
- [ ] Update App Store description
- [ ] Capture widget screenshots

### Release
- [ ] Build with EAS or Xcode
- [ ] Test on physical device
- [ ] Submit to App Store
- [ ] Update version to 1.9.0

---

## Potential Challenges & Solutions

### Challenge 1: Expo Widget Support
**Issue:** Expo has limited native widget support
**Solution:** Use bare workflow or EAS Build with custom native code

### Challenge 2: Font Loading in Widget
**Issue:** Custom fonts may not load in widget extension
**Solution:** Ensure font is added to widget target and Info.plist is updated correctly

### Challenge 3: Widget Refresh Timing
**Issue:** iOS controls when widgets actually refresh (battery optimization)
**Solution:** Set timeline policy appropriately and communicate to users that updates are "approximate"

### Challenge 4: Shared Storage Sync
**Issue:** Widget may show stale data if app hasn't run recently
**Solution:** Implement background refresh or accept that widget shows last known insult

---

## Future Enhancements (v2.0+)

- **Widget Configuration:** Let users choose widget-specific settings (different from main app)
- **Lock Screen Widgets:** Dedicated iOS 16+ lock screen circular widgets
- **Interactive Widgets (iOS 17+):** Tap to cycle through insults without opening app
- **StandBy Mode:** Large clock-style widget for iPhone in landscape charging
- **Live Activities:** Show "insult countdowns" as Live Activities

---

## Resources & References

- [Apple WidgetKit Documentation](https://developer.apple.com/documentation/widgetkit)
- [Expo Widget Guide](https://docs.expo.dev/guides/widgets/)
- [SwiftUI Widget Tutorial](https://developer.apple.com/tutorials/swiftui/creating-a-widget-extension)
- [App Groups Programming Guide](https://developer.apple.com/library/archive/documentation/Miscellaneous/Reference/EntitlementKeyReference/Chapters/EnablingAppSandbox.html#//apple_ref/doc/uid/TP40011195-CH4-SW19)
- [react-native-shared-group-preferences](https://github.com/KjellConnelly/react-native-shared-group-preferences)

---

## Success Metrics

After v1.9.0 release, track:
- % of users who add the widget
- Widget tap-through rate (deep link opens)
- User feedback on widget feature
- App Store rating impact
- Feature request: "Can I get widgets for Android?" (means iOS widgets are successful!)

---

**Ready to build?** Start with Phase 1 (Setup) and work through systematically. The widget will be a delightful addition that keeps users engaged daily! 🎭
