# The Insolent Bard

A Shakespearean insult generator iOS app powered by React Native, Expo and Rust, bringing 400 years of eloquent invective to your fingertips.

## Overview

**The Insolent Bard** is your personal Shakespearean insult generator with over 125,000 unique combinations of colorful invective. Whether settling a debate with friends, spicing up your text messages, or simply appreciating the artistry of a well-crafted insult, The Insolent Bard brings Elizabethan wit to modern times.

Because "Thou art a churlish, motley-minded knave" will always hit harder than "You're annoying."

## iOS App

**The Insolent Bard** (v2.6.14) delivers authentic Shakespearean insults with a modern, intuitive interface.

### Features

- **Autonomous Home Screen Widget** - Add a widget to your home screen that displays a new insult every hour, completely autonomously - no app interaction needed!
- **Share as Image** - Long-press easter eggs to share beautiful parchment-styled images
- **Swipe Gestures** - Swipe left on any insult to reveal quick actions (favorite/unfavorite and share as image)
- **Parchment Card Design** - Beautiful card-style list items with depth, shadows, and aged parchment background
- **IM Fell English Font** - Classic typeface that balances medieval character with excellent readability
- **Browse & Search** - Scroll through 1,000 randomly-sampled insults with real-time search filtering
- **Refresh for More** - Tap the refresh icon to load a new random batch from 10,000+ insults
- **Multi-Select** - Tap multiple insults to select them all at once
- **Smart Clipboard** - Selected insults automatically copied, each on its own line
- **Share Anywhere** - Send via SMS or share to any app on your device
- **Save Favorites** - Long-press any insult to save it for later
- **Bulk Operations** - Select and share/forget multiple favorites at once
- **Clear All Favorites** - Convenient trash icon in favorites header to clear all saved insults at once
- **Seasonal Easter Eggs** - Subtle hidden icons - tap for elegant Old English overlay, long-press to share as image
- **Customizable Settings** - Toggle haptics, adjust easter egg frequency, choose sound effects, control volume
- **Sound Effects** - Audible feedback when adding favorites (when haptics are off) with choice of chime or pop
- **Dark Mode** - Automatic light/dark theme matching your device settings
- **Optimized Performance** - FlashList rendering for smooth scrolling, only 0.81MB data file

### Tech Stack

- **React Native 19.1** + **Expo 54** for cross-platform mobile development
- **iOS WidgetKit** + **SwiftUI** for native home screen widget with three sizes
- **App Groups** + **Shared UserDefaults** for data sharing between app and widget
- **react-native-shared-group-preferences** for cross-platform widget data communication
- **react-native-widgetkit** for triggering widget timeline reloads
- **FlashList** for optimized list rendering with 1,000+ items
- **react-native-gesture-handler** for smooth swipe gestures and animations
- **Random Sampling** - Fisher-Yates shuffle for unbiased insult selection
- **Custom Hooks Architecture** for clean state management
  - `useClipboard`, `useShare`, `useHaptics`, `useSound`, `useSettings`, `useAppContext`, `useImageShare`, `useInsultSelection`
- **expo-av** for audio playback with configurable sound effects
- **expo-sharing** + **react-native-view-shot** for image generation and sharing
- **AsyncStorage** for persistent favorites and settings
- **Custom Fonts** - IM Fell English for list items, BlackChancery Old English for special text displays
- **Google Fonts Integration** via @expo-google-fonts for professional typography
- **Context Providers** - Theme, Settings, and App state management
- **Theme System** with automatic dark/light mode detection
- **Animated API** for smooth UI transitions and swipeable components

### Download

[![Download on the App Store](https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg)](https://apps.apple.com/app/the-insolent-bard/id6753878386)

Available now on the [App Store](https://apps.apple.com/app/the-insolent-bard/id6753878386).

### Home Screen Widget

The Insolent Bard includes a beautiful, **fully autonomous** home screen widget that displays Shakespearean insults directly on your iOS home screen.

**Adding a Widget:**
1. Long-press your home screen to enter edit mode
2. Tap the + icon in the top left
3. Search for "The Insolent Bard"
4. Choose your preferred size (small, medium, or large)
5. Tap "Add Widget"

**Widget Features:**
- Displays a new insult every hour in elegant IM Fell English font
- Aged parchment background matching the app's aesthetic
- Three sizes available (small, medium, large)
- **Completely autonomous** - works independently after initial setup
- Tap the widget to open the app

**How It Works:**

The widget operates completely autonomously once you've opened the app at least once:

1. **Initial Sync**: When you launch the app, it syncs the full insult database (10k insults) to App Group UserDefaults
2. **Autonomous Timeline**: The widget generates a 48-hour timeline (48 insults, one per hour) from the synced database
3. **Hourly Updates**: iOS displays a new insult every hour automatically - no app interaction needed
4. **Automatic Refresh**: After 48 hours, the widget automatically generates a fresh batch of 48 new insults

The widget uses iOS's native timeline system with the `.atEnd` policy, meaning it's completely self-sufficient and doesn't depend on the app running in the background.

**Technical Implementation:**

The widget uses iOS WidgetKit with SwiftUI for the UI, App Groups for shared storage, and WidgetKit's Timeline Provider with `.atEnd` policy for autonomous operation. The full insult database is synced once from the React Native app to shared UserDefaults using `react-native-shared-group-preferences`. The widget's Swift code then generates randomized 48-hour timelines independently, with automatic regeneration handled entirely by iOS.

## Rust CLI Generator

The heart of The Insolent Bard is a high-performance Rust CLI that generates authentic Shakespearean insults by combining phrases from a curated dataset.

### How It Works

Each insult follows the classic format: "Thou [adjective] [adjective] [noun]!"

With 50 phrases per column, the generator creates **125,000 unique combinations** (50³).

### Quick Start

```bash
cd generator
cargo run
# Output: Thou gleeking flap-mouthed foot-licker!
```

### Command-Line Arguments

| Argument | Description |
| :-: |:-: |
| _-c, --count COUNT_ | Generate COUNT number of insults to standard output (default: 1, max: 20000) |
| _-p, --phrases PATH_ | Use PATH as the phrases source file (default: `data/phrases`) |
| _-g, --genfile PATH_ | Generate all combinations as JSON and write them to PATH |
| _-h, --help_ | Display help information |
| _-V, --version_ | Display version information |

### Examples

```bash
# Generate a single insult
cd generator && cargo run

# Generate 5 insults
cd generator && cargo run -- -c 5

# Use a custom phrases file
cd generator && cargo run -- -p /path/to/custom/phrases

# Generate JSON file for the iOS app
cd generator && cargo run -- -g ../assets/data/insults.json
```

For production use, build the optimized release binary:

```bash
cd generator && cargo build --release
./target/release/genrust -c 10
```

### Phrases File Format

The generator uses a tab-delimited phrases file located in `generator/data/phrases`. Each line contains three
tab-separated tokens representing two adjectives and one noun.

**Format Requirements:**
- **Three columns per line**: `[adjective]\t[adjective]\t[noun]`
- **Tab-separated values**: Single tab character between each token
- **50 lines**: Creates 125,000 possible combinations (50³)

**Custom Phrases:**

You can provide your own phrases file using the `-p` flag. The generator validates the format and provides
helpful error messages for malformed files.

Example line:
```
gleeking	flap-mouthed	foot-licker
```

## Architecture

### Rust Generator

- **Modular Design**: Separated into focused modules (`parser`, `generator`, `error`)
- **Embedded Data**: Phrases file compiled into binary using `include_str!()` for zero-dependency execution
- **Performance**: jemalloc allocator for optimized memory management
- **CLI**: clap for robust argument parsing and automatic help generation
- **Error Handling**: Comprehensive error types with helpful messages
- **Type Safety**: Compile-time guarantees via Rust's type system

### iOS App Architecture

- **Component-Based**: Modular React components with single responsibility
- **Context Providers**: Global state management for app settings, theme, and favorites
- **Custom Hooks**: Reusable logic for clipboard, sharing, haptics, and data fetching
- **Persistent Storage**: AsyncStorage for favorites and settings with automatic serialization
- **Random Sampling**: Fisher-Yates algorithm for unbiased insult selection from 10k pool
- **Theme System**: Dynamic color palette with automatic light/dark mode detection
- **Settings Management**: User preferences for haptics, easter eggs, and favorites
- **Optimized Rendering**: FlashList with memoization and callback optimization

## Development

### Prerequisites

- **Rust**: 1.70+ for CLI generator
- **Node.js**: 18+ for iOS app
- **Expo CLI**: For running and building the mobile app
- **Xcode**: For iOS simulator and App Store builds

### Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/TheOffensiveBard.git
cd TheOffensiveBard

# Build Rust generator
cd generator
cargo build --release

# Install iOS app dependencies
cd ..
npm install

# Run the app
npx expo start
```

### Project Structure

```
TheOffensiveBard/
├── generator/          # Rust CLI insult generator
│   ├── src/           # Rust source code (parser, generator, error modules)
│   ├── data/          # Phrases data file (tab-delimited)
│   ├── Cargo.toml     # Rust dependencies
│   └── target/        # Compiled binaries (debug/release)
├── ios/               # iOS native code
│   ├── InsultWidget/  # iOS home screen widget (SwiftUI)
│   │   ├── InsultWidget.swift         # Widget implementation
│   │   ├── InsultWidgetBundle.swift   # Widget bundle
│   │   ├── Assets.xcassets/           # Widget assets
│   │   └── Info.plist                 # Widget configuration
│   ├── InsultWidgetExtension.entitlements  # App Groups entitlement
│   └── TheInsolentBard/                    # Main iOS app
│       └── TheInsolentBard.entitlements    # App Groups entitlement
├── src/               # React Native app source
│   ├── mobile/        # UI components (InsultsHeader, Settings, TouchableIcon, etc.)
│   ├── contexts/      # React context providers (Theme, Settings, App state)
│   ├── hooks/         # Custom hooks (useClipboard, useHaptics, useInsultOfTheHour, etc.)
│   ├── styles/        # Style definitions and color palettes
│   ├── utils/         # Utility functions (shuffling, formatting, widgetDataShare)
│   └── components/    # Reusable components
├── plugins/           # Expo config plugins
│   └── withInsultWidget.js  # Widget entitlements plugin
├── assets/            # App assets
│   ├── data/          # Insults JSON file (0.81MB)
│   ├── fonts/         # Custom fonts (IM Fell English, BlackChancery)
│   ├── sounds/        # Sound effects (chime, pop)
│   └── about.html     # In-app About page
├── AppStore/          # App Store screenshots and assets
├── docs/              # Additional documentation
├── App.js             # App entry point
├── app.json           # Expo configuration
├── package.json       # Node dependencies
└── README.md          # This file
```

## License

MIT License. See [LICENSE.md](LICENSE.md) for details.

## Author

[David E. Young](mailto:sporty-iron883@protonmail.com)
