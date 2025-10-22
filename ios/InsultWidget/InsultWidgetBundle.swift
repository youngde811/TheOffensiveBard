//
//  InsultWidgetBundle.swift
//  InsultWidget
//
//  Created by David Young on 10/22/25.
//

import WidgetKit
import SwiftUI

@main
struct InsultWidgetBundle: WidgetBundle {
    var body: some Widget {
        InsultWidget()
        InsultWidgetControl()
        InsultWidgetLiveActivity()
    }
}
