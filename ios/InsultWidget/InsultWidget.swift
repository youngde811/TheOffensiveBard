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
          insult: "Thou churlish, motley-minded knave!",
          timestamp: "Just now"
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

        print("[Widget] Attempting to load insult database from App Group")
        print("[Widget] App Group: group.com.bosshog811.TheInsolentBard")
        print("[Widget] Key: insultDatabase")

        // Try to read the raw string first
        if let testString = sharedDefaults?.string(forKey: "insultDatabase") {
            print("[Widget] Successfully read raw string, length: \(testString.count)")
        } else {
            print("[Widget] ERROR: Could not read raw string from UserDefaults")
            print("[Widget] Available keys: \(sharedDefaults?.dictionaryRepresentation().keys ?? [])")
        }

        // Load the insult database
        guard let dataString = sharedDefaults?.string(forKey: "insultDatabase") else {
            print("[Widget] ERROR: dataString is nil")
            return [InsultEntry(
              date: Date(),
              insult: "Thou villainous tickle-brained canker-blossom!",
              timestamp: "Open app to sync"
            )]
        }

        print("[Widget] Got dataString, converting to Data")

        guard let data = dataString.data(using: .utf8) else {
            print("[Widget] ERROR: Could not convert string to Data")
            return [InsultEntry(
              date: Date(),
              insult: "Thou villainous tickle-brained canker-blossom!",
              timestamp: "Open app to sync"
            )]
        }

        print("[Widget] Got Data, parsing JSON")

        guard let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any] else {
            print("[Widget] ERROR: Could not parse JSON")
            return [InsultEntry(
              date: Date(),
              insult: "Thou villainous tickle-brained canker-blossom!",
              timestamp: "Open app to sync"
            )]
        }

        print("[Widget] Parsed JSON successfully, keys: \(json.keys)")

        guard let insults = json["insults"] as? [String] else {
            print("[Widget] ERROR: Could not extract insults array")
            return [InsultEntry(
              date: Date(),
              insult: "Thou villainous tickle-brained canker-blossom!",
              timestamp: "Open app to sync"
            )]
        }

        guard !insults.isEmpty else {
            print("[Widget] ERROR: Insults array is empty")
            return [InsultEntry(
              date: Date(),
              insult: "Thou villainous tickle-brained canker-blossom!",
              timestamp: "Open app to sync"
            )]
        }

        print("[Widget] Successfully loaded \(insults.count) insults from database")

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
                  timestamp: timestamp
                ))
            }
        }

        return entries.isEmpty ? [InsultEntry(
          date: Date(),
          insult: "Thy wit is as thick as Tewksbury mustard!",
          timestamp: "Error"
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
            // Aged parchment background
            Color(red: 0.945, green: 0.933, blue: 0.898) // #f1eee5

            VStack(spacing: 4) {
                Text("🎭")
                  .font(.title2)

                Text(entry.insult)
                  .font(.system(size: 9))
                  .fontWeight(.medium)
                  .multilineTextAlignment(.center)
                  .lineLimit(4)
                  .foregroundColor(Color(red: 0.545, green: 0.251, blue: 0.286)) // #8B4049
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
            // Aged parchment background
            Color(red: 0.945, green: 0.933, blue: 0.898) // #f1eee5

            VStack(alignment: .leading, spacing: 8) {
                // Title
                Text("THE INSOLENT BARD")
                  .font(.system(size: 10, weight: .bold))
                  .foregroundColor(Color(red: 0.373, green: 0.620, blue: 0.627)) // cadetblue
                  .tracking(1.5)

                Spacer()

                // Insult text
                Text(entry.insult)
                  .font(.custom("IMFellEnglish-Regular", size: 14))
                  .fontWeight(.semibold)
                  .foregroundColor(Color(red: 0.545, green: 0.251, blue: 0.286)) // #8B4049
                  .multilineTextAlignment(.leading)
                  .lineLimit(5)
                  .lineSpacing(3)

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
            // Aged parchment background
            Color(red: 0.945, green: 0.933, blue: 0.898) // #f1eee5

            VStack(alignment: .center, spacing: 12) {
                // Title with decorative elements
                HStack {
                    Text("⚔️")
                    Text("THE INSOLENT BARD")
                      .font(.system(size: 14, weight: .bold))
                      .tracking(2)
                    Text("🎭")
                }
                  .foregroundColor(Color(red: 0.373, green: 0.620, blue: 0.627)) // cadetblue

                Spacer()

                // Insult text (larger)
                Text(entry.insult)
                  .font(.custom("IMFellEnglish-Regular", size: 18))
                  .fontWeight(.bold)
                  .foregroundColor(Color(red: 0.545, green: 0.251, blue: 0.286)) // #8B4049
                  .multilineTextAlignment(.center)
                  .lineLimit(6)
                  .lineSpacing(5)
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

struct InsultWidget: Widget {
    let kind: String = "InsultWidget"

    @available(iOSApplicationExtension 15.1, *)
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: InsultProvider()) { entry in
            if #available(iOSApplicationExtension 17.0, *) {
                InsultWidgetEntryView(entry: entry)
                  .containerBackground(Color(red: 0.945, green: 0.933, blue: 0.898), for: .widget)
            } else {
                InsultWidgetEntryView(entry: entry)
                  .background(Color(red: 0.945, green: 0.933, blue: 0.898))
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
      timestamp: "5 minutes ago"
    )
    InsultEntry(
      date: Date(),
      insult: "Thou puking tickle-brained canker-blossom!",
      timestamp: "Just now"
    )
}
