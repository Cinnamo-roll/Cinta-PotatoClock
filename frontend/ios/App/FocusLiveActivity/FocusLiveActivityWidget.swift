import ActivityKit
import SwiftUI
import WidgetKit

struct FocusLiveActivityWidget: Widget {
    var body: some WidgetConfiguration {
        ActivityConfiguration(for: FocusActivityAttributes.self) { context in
            LockScreenTimerView(context: context)
                .activityBackgroundTint(Color(red: 1.0, green: 0.96, blue: 0.84))
                .activitySystemActionForegroundColor(Color(red: 0.30, green: 0.22, blue: 0.14))
        } dynamicIsland: { context in
            DynamicIsland {
                DynamicIslandExpandedRegion(.leading) {
                    HStack(spacing: 6) {
                        Image(systemName: "clock.fill")
                        Text("土豆时钟")
                            .font(.system(.caption, design: .rounded).weight(.bold))
                    }
                    .foregroundStyle(Color(red: 0.95, green: 0.65, blue: 0.20))
                }
                DynamicIslandExpandedRegion(.trailing) {
                    TimerValueView(state: context.state, compact: true)
                        .font(.system(.headline, design: .rounded).monospacedDigit())
                }
                DynamicIslandExpandedRegion(.bottom) {
                    HStack(spacing: 8) {
                        Text(context.state.title)
                            .font(.system(.subheadline, design: .rounded).weight(.semibold))
                            .lineLimit(1)
                        Spacer(minLength: 4)
                        Text(context.state.state == "paused" ? "已暂停" : "专注中")
                            .font(.system(.caption2, design: .rounded).weight(.bold))
                            .foregroundStyle(.secondary)
                    }
                }
            } compactLeading: {
                Image(systemName: "clock.fill")
                    .foregroundStyle(Color(red: 0.95, green: 0.65, blue: 0.20))
            } compactTrailing: {
                TimerValueView(state: context.state, compact: true)
                    .font(.system(.caption, design: .rounded).monospacedDigit())
                    .frame(maxWidth: 52)
            } minimal: {
                Image(systemName: "clock.fill")
                    .foregroundStyle(Color(red: 0.95, green: 0.65, blue: 0.20))
            }
            .keylineTint(Color(red: 0.95, green: 0.65, blue: 0.20))
        }
    }
}

private struct LockScreenTimerView: View {
    let context: ActivityViewContext<FocusActivityAttributes>

    var body: some View {
        HStack(spacing: 14) {
            ZStack {
                Circle().fill(Color(red: 1.0, green: 0.88, blue: 0.56))
                Image(systemName: "clock.fill")
                    .font(.title3.weight(.bold))
                    .foregroundStyle(Color(red: 0.48, green: 0.31, blue: 0.14))
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
                .padding(.horizontal, 10)
                .padding(.vertical, 7)
                .background(.white.opacity(0.55), in: Capsule())
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
