//
//  InsultWidgetLiveActivity.swift
//  InsultWidget
//
//  Created by David Young on 10/22/25.
//

import ActivityKit
import WidgetKit
import SwiftUI

struct InsultWidgetAttributes: ActivityAttributes {
    public struct ContentState: Codable, Hashable {
        // Dynamic stateful properties about your activity go here!
        var emoji: String
    }

    // Fixed non-changing properties about your activity go here!
    var name: String
}

struct InsultWidgetLiveActivity: Widget {
    var body: some WidgetConfiguration {
        ActivityConfiguration(for: InsultWidgetAttributes.self) { context in
            // Lock screen/banner UI goes here
            VStack {
                Text("Hello \(context.state.emoji)")
            }
            .activityBackgroundTint(Color.cyan)
            .activitySystemActionForegroundColor(Color.black)

        } dynamicIsland: { context in
            DynamicIsland {
                // Expanded UI goes here.  Compose the expanded UI through
                // various regions, like leading/trailing/center/bottom
                DynamicIslandExpandedRegion(.leading) {
                    Text("Leading")
                }
                DynamicIslandExpandedRegion(.trailing) {
                    Text("Trailing")
                }
                DynamicIslandExpandedRegion(.bottom) {
                    Text("Bottom \(context.state.emoji)")
                    // more content
                }
            } compactLeading: {
                Text("L")
            } compactTrailing: {
                Text("T \(context.state.emoji)")
            } minimal: {
                Text(context.state.emoji)
            }
            .widgetURL(URL(string: "http://www.apple.com"))
            .keylineTint(Color.red)
        }
    }
}

extension InsultWidgetAttributes {
    fileprivate static var preview: InsultWidgetAttributes {
        InsultWidgetAttributes(name: "World")
    }
}

extension InsultWidgetAttributes.ContentState {
    fileprivate static var smiley: InsultWidgetAttributes.ContentState {
        InsultWidgetAttributes.ContentState(emoji: "😀")
     }
     
     fileprivate static var starEyes: InsultWidgetAttributes.ContentState {
         InsultWidgetAttributes.ContentState(emoji: "🤩")
     }
}

#Preview("Notification", as: .content, using: InsultWidgetAttributes.preview) {
   InsultWidgetLiveActivity()
} contentStates: {
    InsultWidgetAttributes.ContentState.smiley
    InsultWidgetAttributes.ContentState.starEyes
}
