import ActivityKit
import Foundation

@available(iOS 16.1, *)
struct FocusActivityAttributes: ActivityAttributes {
    struct ContentState: Codable, Hashable {
        var title: String
        var timerType: String
        var state: String
        var startedAt: Double
        var endAt: Double
        var displaySeconds: Int
    }

    var todoId: Int
}
