import ActivityKit
import SwiftUI
import WidgetKit

struct FocusLiveActivityWidget: Widget {
    var body: some WidgetConfiguration {
        ActivityConfiguration(for: FocusActivityAttributes.self) { context in
            LockScreenTimerView(context: context)
                .activityBackgroundTint(Color(red: 1.0, green: 0.95, blue: 0.78))
                .activitySystemActionForegroundColor(Color(red: 0.32, green: 0.22, blue: 0.16))
        } dynamicIsland: { context in
            DynamicIsland {
                DynamicIslandExpandedRegion(.leading) {
                    Image(systemName: "timer")
                        .foregroundStyle(Color(red: 0.40, green: 0.67, blue: 0.47))
                }
                DynamicIslandExpandedRegion(.trailing) {
                    TimerValueView(state: context.state, compact: true)
                        .font(.system(.headline, design: .rounded).monospacedDigit())
                }
                DynamicIslandExpandedRegion(.bottom) {
                    Text(context.state.title)
                        .font(.system(.subheadline, design: .rounded).weight(.semibold))
                        .lineLimit(1)
                }
            } compactLeading: {
                Image(systemName: "timer")
                    .foregroundStyle(Color(red: 0.40, green: 0.67, blue: 0.47))
            } compactTrailing: {
                TimerValueView(state: context.state, compact: true)
                    .font(.system(.caption, design: .rounded).monospacedDigit())
                    .frame(maxWidth: 52)
            } minimal: {
                Image(systemName: "timer")
                    .foregroundStyle(Color(red: 0.40, green: 0.67, blue: 0.47))
            }
            .keylineTint(Color(red: 0.40, green: 0.67, blue: 0.47))
        }
    }
}

private struct LockScreenTimerView: View {
    let context: ActivityViewContext<FocusActivityAttributes>

    var body: some View {
        HStack(spacing: 14) {
            ZStack {
                Circle().fill(Color(red: 0.88, green: 0.96, blue: 0.89))
                Image(systemName: "timer")
                    .font(.title3.weight(.bold))
                    .foregroundStyle(Color(red: 0.34, green: 0.60, blue: 0.40))
            }
            .frame(width: 44, height: 44)

            VStack(alignment: .leading, spacing: 4) {
                Text(context.state.state == "paused" ? "专注已暂停" : "正在专注")
                    .font(.system(.caption, design: .rounded).weight(.semibold))
                    .foregroundStyle(.secondary)
                Text(context.state.title)
                    .font(.system(.headline, design: .rounded).weight(.bold))
                    .lineLimit(1)
            }

            Spacer(minLength: 8)

            TimerValueView(state: context.state, compact: false)
                .font(.system(.title3, design: .rounded).weight(.bold).monospacedDigit())
        }
        .padding(16)
    }
}

private struct TimerValueView: View {
    let state: FocusActivityAttributes.ContentState
    let compact: Bool

    var body: some View {
        if state.state != "running" || state.timerType == "none" {
            Text(formatDuration(state.displaySeconds, compact: compact))
        } else if state.timerType == "countdown", state.endAt > 0 {
            let endDate = Date(timeIntervalSince1970: state.endAt / 1000)
            let startDate = min(Date(), endDate)
            Text(
                timerInterval: startDate...endDate,
                countsDown: true,
                showsHours: true
            )
        } else {
            Text(
                timerInterval: Date(timeIntervalSince1970: state.startedAt / 1000)...Date.distantFuture,
                countsDown: false,
                showsHours: true
            )
        }
    }

    private func formatDuration(_ seconds: Int, compact: Bool) -> String {
        let safeSeconds = max(0, seconds)
        let hours = safeSeconds / 3600
        let minutes = (safeSeconds % 3600) / 60
        let remainingSeconds = safeSeconds % 60
        if hours > 0 {
            return String(format: "%d:%02d:%02d", hours, minutes, remainingSeconds)
        }
        return String(format: compact ? "%d:%02d" : "%02d:%02d", minutes, remainingSeconds)
    }
}
