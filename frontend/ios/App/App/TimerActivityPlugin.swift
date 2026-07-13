/*
 * Copyright 2026 CintaOvO
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * Original project: https://github.com/Cinnamo-roll/Cinta-PotatoClock
 */

import ActivityKit
import Capacitor
import Foundation

@objc(TimerActivityPlugin)
public class TimerActivityPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "TimerActivityPlugin"
    public let jsName = "TimerActivity"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "sync", returnType: CAPPluginReturnPromise)
    ]

    @objc func sync(_ call: CAPPluginCall) {
        guard #available(iOS 16.1, *) else {
            call.resolve()
            return
        }

        let todoId = call.getInt("todoId") ?? 0
        let state = call.getString("state") ?? "idle"
        let contentState = FocusActivityAttributes.ContentState(
            title: call.getString("title") ?? "专注计时",
            timerType: call.getString("timerType") ?? "countdown",
            state: state,
            startedAt: call.getDouble("startedAt") ?? 0,
            endAt: call.getDouble("endAt") ?? 0,
            displaySeconds: call.getInt("displaySeconds") ?? 0
        )

        Task {
            let matchingActivities = Activity<FocusActivityAttributes>.activities.filter {
                todoId == 0 || $0.attributes.todoId == todoId
            }

            if state == "running" || state == "paused" {
                if let activity = matchingActivities.first {
                    await activity.update(using: contentState)
                } else if ActivityAuthorizationInfo().areActivitiesEnabled, todoId != 0 {
                    do {
                        _ = try Activity<FocusActivityAttributes>.request(
                            attributes: FocusActivityAttributes(todoId: todoId),
                            contentState: contentState,
                            pushType: nil
                        )
                    } catch {
                        call.reject("无法启动实时计时卡片", nil, error)
                        return
                    }
                }
            } else {
                let dismissalPolicy: ActivityUIDismissalPolicy = state == "completed"
                    ? .after(Date().addingTimeInterval(60))
                    : .immediate
                for activity in matchingActivities {
                    await activity.end(using: contentState, dismissalPolicy: dismissalPolicy)
                }
            }
            call.resolve()
        }
    }
}
