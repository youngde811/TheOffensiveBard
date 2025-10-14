# The Insolent Bard

A Shakespearean insult generator iOS app powered by Rust, bringing 400 years of eloquent invective to your fingertips.

## Overview

**The Insolent Bard** is your personal Shakespearean insult generator with over 125,000 unique combinations of colorful invective. Whether settling a debate with friends, spicing up your text messages, or simply appreciating the artistry of a well-crafted insult, The Insolent Bard brings Elizabethan wit to modern times.

Because "Thou art a churlish, motley-minded knave" will always hit harder than "You're annoying."

## iOS App

**The Insolent Bard** (v1.0.10) delivers authentic Shakespearean insults with a modern, intuitive interface.

### Features

- **Browse & Search** - Scroll through 125,000+ insults with real-time search filtering
- **Multi-Select** - Tap multiple insults to select them all at once
- **Smart Clipboard** - Selected insults automatically copied, each on its own line
- **Share Anywhere** - Send via SMS or share to any app on your device
- **Save Favorites** - Long-press any insult to save it for later
- **Bulk Operations** - Select and share/forget multiple favorites at once
- **Seasonal Easter Eggs** - Discover random insults with elegant overlay surprises
- **Dark Mode** - Automatic light/dark theme matching your device settings
- **Optimized Performance** - FlashList rendering for smooth scrolling through thousands of insults

### Tech Stack

- **React Native 19.1** + **Expo 54** for cross-platform mobile development
- **FlashList** for optimized list rendering with 125K+ items
- **Custom Hooks Architecture** for clean state management
  - `useClipboard`, `useShare`, `useHaptics`, `useFavorites`, `useAppContext`
- **AsyncStorage** for persistent favorites
- **Theme System** with automatic dark/light mode detection
- **Animated API** for smooth UI transitions

### Download

Available on the App Store (link coming after approval).

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
| _-c, --count COUNT_ | Generate COUNT number of insults to standard output (default: 1) |
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

## Future: Dynamic Insult API

Coming in a future release: A Rust-powered web API service that will provide dynamic insult generation on-demand.

**Planned Features:**
- RESTful API for fetching fresh insults
- Real-time generation (no pre-computed JSON)
- Configurable insult count per request
- Filter by style, severity, or theme
- Rate limiting and caching for optimal performance

This will enable the iOS app to fetch new insults dynamically rather than relying solely on the embedded dataset, opening the door for expanded vocabulary, themed collections, and user-contributed phrases.

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
- **Persistent Storage**: AsyncStorage for favorites with automatic serialization
- **Theme System**: Dynamic color palette with automatic light/dark mode detection
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
│   ├── src/           # Rust source code
│   ├── data/          # Phrases data file
│   └── Cargo.toml     # Rust dependencies
├── src/               # iOS app source
│   ├── mobile/        # React Native components
│   ├── contexts/      # React context providers
│   ├── hooks/         # Custom React hooks
│   ├── styles/        # Style definitions
│   └── utils/         # Utility functions
├── assets/            # App assets (fonts, images, data)
├── App.js             # App entry point
└── README.md          # This file
```

## License

MIT License. See [LICENSE.md](LICENSE.md) for details.

## Credits

Based on [Kurt Blair's Shakespearean Insult Generator](https://github.com/Kurt-Blair/Shakespearean-Insult-Generator).

Inspired by [Lord Buckley's](http://www.lordbuckley.com/the-word-new/transcriptions/willie-the-shake.html) "Willie The Shake" performance.

## Author

[David E. Young](mailto:youngde811@pobox.com)
