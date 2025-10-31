// This file contains the widget support for our Insolent Bard iOS app.

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

// NB: The color manipulation code here is courtesy of Claude-4. It understands graphics way better than
// I do.

import WidgetKit
import SwiftUI

struct GlobalConstants {
    static let widgetUrl = "insolentbard://share-insult"
}

// MARK: - Color Helper
extension Color {
    init(hex: String, opacity: Double = 1.0) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0

        Scanner(string: hex).scanHexInt64(&int)

        let r, g, b: UInt64

        switch hex.count {
        case 3: // RGB (12-bit)
            (r, g, b) = ((int >> 8) * 17, (int >> 4 & 0xF) * 17, (int & 0xF) * 17)
        case 6: // RGB (24-bit)
            (r, g, b) = (int >> 16, int >> 8 & 0xFF, int & 0xFF)
        case 8: // ARGB (32-bit)
            (r, g, b) = (int >> 16 & 0xFF, int >> 8 & 0xFF, int & 0xFF)
        default:
            (r, g, b) = (241, 238, 229) // Default parchment color
        }

        self.init(
            .sRGB,
            red: Double(r) / 255,
            green: Double(g) / 255,
            blue:  Double(b) / 255,
            opacity: min(max(opacity, 0), 1)
        )
    }

    // Calculate if a color is "dark" using relative luminance
    func isDark(hex: String) -> Bool {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        
        Scanner(string: hex).scanHexInt64(&int)

        let r, g, b: Double

        switch hex.count {
        case 3:
            r = Double((int >> 8) * 17) / 255.0
            g = Double((int >> 4 & 0xF) * 17) / 255.0
            b = Double((int & 0xF) * 17) / 255.0
        case 6:
            r = Double(int >> 16) / 255.0
            g = Double(int >> 8 & 0xFF) / 255.0
            b = Double(int & 0xFF) / 255.0
        default:
            return false // Default to light
        }

        // Calculate relative luminance using WCAG formula
        let luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b

        // If luminance is less than 0.5, it's a dark color
        return luminance < 0.5
    }
}

// MARK: - Data Model
struct InsultEntry: TimelineEntry {
    let date: Date
    let insult: String
    let timestamp: String
    let backgroundColor: Color
    let backgroundOpacity: Double
    let backgroundColorHex: String

    // Computed property for text colors based on background brightness
    var insultTextColor: Color {
        Color(hex: "").isDark(hex: backgroundColorHex) ?
            Color(red: 0.9, green: 0.85, blue: 0.8) : // Light text for dark backgrounds
            Color(red: 0.545, green: 0.251, blue: 0.286) // Dark burgundy for light backgrounds
    }

    var titleColor: Color {
        Color(hex: "").isDark(hex: backgroundColorHex) ?
            Color(red: 0.6, green: 0.8, blue: 0.82) : // Lighter cadet blue for dark backgrounds
            Color(red: 0.373, green: 0.620, blue: 0.627) // Cadet blue for light backgrounds
    }

    var timestampColor: Color {
        Color(hex: "").isDark(hex: backgroundColorHex) ?
            Color(white: 0.7) : // Light gray for dark backgrounds
            Color.gray // Gray for light backgrounds
    }
}

// MARK: - Timeline Provider
struct InsultProvider: TimelineProvider {
    func placeholder(in context: Context) -> InsultEntry {
        InsultEntry(
          date: Date(),
          insult: "Thou churlish, motley-minded knave!",
          timestamp: "Just now",
          backgroundColor: Color(red: 0.945, green: 0.933, blue: 0.898),
          backgroundOpacity: 1.0,
          backgroundColorHex: "#f1eee5"
        )
    }

    func getSnapshot(in context: Context, completion: @escaping (InsultEntry) -> ()) {
        // For preview, just show the first entry from our timeline
        let entries = generateTimelineEntries()

        completion(entries.first ?? placeholder(in: context))
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<InsultEntry>) -> ()) {
        let entries = generateTimelineEntries()

        // Use .atEnd policy to regenerate timeline after 48 hours
        let timeline = Timeline(entries: entries, policy: .atEnd)

        completion(timeline)
    }

    private func generateTimelineEntries() -> [InsultEntry] {
        let sharedDefaults = UserDefaults(suiteName: "group.com.bosshog811.TheInsolentBard")

        // Default background settings
        let defaultBgColor = Color(red: 0.945, green: 0.933, blue: 0.898)
        let defaultBgOpacity = 1.0

        // Load the insult database
        guard let dataString = sharedDefaults?.string(forKey: "insultDatabase") else {
            return [InsultEntry(
              date: Date(),
              insult: "Thou villainous tickle-brained canker-blossom!",
              timestamp: "Open app to sync",
              backgroundColor: defaultBgColor,
              backgroundOpacity: defaultBgOpacity,
              backgroundColorHex: "#f1eee5"
            )]
        }

        guard let data = dataString.data(using: .utf8) else {
            return [InsultEntry(
              date: Date(),
              insult: "Thou villainous tickle-brained canker-blossom!",
              timestamp: "Open app to sync",
              backgroundColor: defaultBgColor,
              backgroundOpacity: defaultBgOpacity,
              backgroundColorHex: "#f1eee5"
            )]
        }

        guard let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any] else {
            return [InsultEntry(
              date: Date(),
              insult: "Thou villainous tickle-brained canker-blossom!",
              timestamp: "Open app to sync",
              backgroundColor: defaultBgColor,
              backgroundOpacity: defaultBgOpacity,
              backgroundColorHex: "#f1eee5"
            )]
        }

        guard let insults = json["insults"] as? [String] else {
            return [InsultEntry(
              date: Date(),
              insult: "Thou villainous tickle-brained canker-blossom!",
              timestamp: "Open app to sync",
              backgroundColor: defaultBgColor,
              backgroundOpacity: defaultBgOpacity,
              backgroundColorHex: "#f1eee5"
            )]
        }

        guard !insults.isEmpty else {
            return [InsultEntry(
              date: Date(),
              insult: "Thou villainous tickle-brained canker-blossom!",
              timestamp: "Open app to sync",
              backgroundColor: defaultBgColor,
              backgroundOpacity: defaultBgOpacity,
              backgroundColorHex: "#f1eee5"
            )]
        }

        // Read background customization settings
        let bgColorHex = json["widgetBackgroundColor"] as? String ?? "#f1eee5"
        let backgroundColor = Color(hex: bgColorHex, opacity: 1.0)

        // Generate 48 timeline entries (one per hour for 48 hours)
        var entries: [InsultEntry] = []
        
        let now = Date()
        let calendar = Calendar.current

        // Randomly select 48 insults from the database
        let selectedInsults = selectRandomInsults(from: insults, count: 48)

        for (index, insult) in selectedInsults.enumerated() {
            // Each entry is 1 hour apart
            if let entryDate = calendar.date(byAdding: .hour, value: index, to: now) {
                let timestamp = formatTimestamp(entryDate)

                entries.append(InsultEntry(
                  date: entryDate,
                  insult: insult,
                  timestamp: timestamp,
                  backgroundColor: backgroundColor,
                  backgroundOpacity: 1.0,
                  backgroundColorHex: bgColorHex
                ))
            }
        }

        return entries.isEmpty ? [InsultEntry(
          date: Date(),
          insult: "Thy wit is as thick as Tewksbury mustard!",
          timestamp: "Error",
          backgroundColor: defaultBgColor,
          backgroundOpacity: defaultBgOpacity,
          backgroundColorHex: "#f1eee5"
        )] : entries
    }

    private func selectRandomInsults(from insults: [String], count: Int) -> [String] {
        // Fisher-Yates shuffle for random selection
        var shuffled = insults
        
        for i in stride(from: shuffled.count - 1, through: 1, by: -1) {
            let j = Int.random(in: 0...i)
            shuffled.swapAt(i, j)
        }

        return Array(shuffled.prefix(min(count, shuffled.count)))
    }

    private func formatTimestamp(_ date: Date) -> String {
        let dateFormatter = DateFormatter()
        
        dateFormatter.dateFormat = "MMM d 'at' h:mm a"

        return dateFormatter.string(from: date)
    }
}

// MARK: - Widget Views

struct SmallWidgetView: View {
    var entry: InsultEntry

    var body: some View {
        ZStack {
            // Custom background from settings
            entry.backgroundColor

            VStack(spacing: 4) {
                Text("🎭")
                  .font(.title2)

                Text(entry.insult)
                  .font(.system(size: 9))
                  .fontWeight(.medium)
                  .multilineTextAlignment(.center)
                  .lineLimit(4)
                  .foregroundColor(entry.insultTextColor)
                  .padding(.horizontal, 8)
                  .padding(.vertical, 6)
                  .background(.thinMaterial)
                  .cornerRadius(8)
                  .shadow(color: .black.opacity(0.3), radius: 4, x: 0, y: 2)
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
            // Custom background from settings
            entry.backgroundColor

            VStack(alignment: .leading, spacing: 8) {
                // Title
                Text("THE INSOLENT BARD")
                  .font(.system(size: 10, weight: .bold))
                  .foregroundColor(entry.titleColor)
                  .tracking(1.5)

                Spacer()

                // Insult text
                Text(entry.insult)
                  .font(.custom("IMFellEnglish-Regular", size: 14))
                  .fontWeight(.semibold)
                  .foregroundColor(entry.insultTextColor)
                  .multilineTextAlignment(.leading)
                  .lineLimit(5)
                  .lineSpacing(3)
                  .padding(12)
                  .background(.thinMaterial)
                  .cornerRadius(8)
                  .shadow(color: .black.opacity(0.3), radius: 4, x: 0, y: 2)

                Spacer()

                // Timestamp
                Text(entry.timestamp)
                  .font(.system(size: 9))
                  .foregroundColor(entry.timestampColor)
                  .opacity(0.7)
            }
              .padding(16)
        }
          .widgetURL(URL(string: GlobalConstants.widgetUrl))
    }
}

struct LargeWidgetView: View {
    var entry: InsultEntry

    var body: some View {
        ZStack {
            // Custom background from settings
            entry.backgroundColor

            VStack(alignment: .center, spacing: 12) {
                // Title with decorative elements
                HStack {
                    Text("⚔️")
                    Text("THE INSOLENT BARD")
                      .font(.system(size: 14, weight: .bold))
                      .tracking(2)
                    Text("🎭")
                }
                  .foregroundColor(entry.titleColor)

                Spacer()

                // Insult text (larger)
                Text(entry.insult)
                  .font(.custom("IMFellEnglish-Regular", size: 18))
                  .fontWeight(.bold)
                  .foregroundColor(entry.insultTextColor)
                  .multilineTextAlignment(.center)
                  .lineLimit(6)
                  .lineSpacing(5)
                  .padding(.horizontal, 20)
                  .padding(.vertical, 12)
                  .background(.thinMaterial)
                  .cornerRadius(12)
                  .shadow(color: .black.opacity(0.3), radius: 5, x: 0, y: 3)

                Spacer()

                // Timestamp
                Text(entry.timestamp)
                  .font(.system(size: 11))
                  .foregroundColor(entry.timestampColor)
                  .opacity(0.7)
            }
              .padding(20)
        }
          .widgetURL(URL(string: GlobalConstants.widgetUrl))
    }
}

// MARK: - Widget Configuration

struct InsultWidget: Widget {
    let kind: String = "InsultWidget"

    @available(iOSApplicationExtension 15.1, *)
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: InsultProvider()) { entry in
            if #available(iOSApplicationExtension 17.0, *) {
                InsultWidgetEntryView(entry: entry)
                  .containerBackground(entry.backgroundColor, for: .widget)
            } else {
                InsultWidgetEntryView(entry: entry)
                  .background(entry.backgroundColor)
            }
        }
          .configurationDisplayName("The Insolent Bard")
          .description("Shakespearean insults that refresh every hour.")
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

@available(iOSApplicationExtension 17.0, *)
#Preview(as: .systemMedium) {
    InsultWidget()
} timeline: {
    InsultEntry(
      date: Date(),
      insult: "Thou gleeking flap-mouthed foot-licker!",
      timestamp: "5 minutes ago",
      backgroundColor: Color(red: 0.945, green: 0.933, blue: 0.898),
      backgroundOpacity: 1.0,
      backgroundColorHex: "#f1eee5"
    )
    InsultEntry(
      date: Date(),
      insult: "Thou puking tickle-brained canker-blossom!",
      timestamp: "Just now",
      backgroundColor: Color(red: 0.945, green: 0.933, blue: 0.898),
      backgroundOpacity: 1.0,
      backgroundColorHex: "#f1eee5"
    )
}
