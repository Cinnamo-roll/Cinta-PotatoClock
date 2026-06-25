import { Badge } from "@/components/common/Badge";
import { Card } from "@/components/common/Card";
import { StatsEmptyState } from "@/components/stats/StatsEmptyState";
import { formatMinutes, timeText } from "@/components/stats/statsFormat";
import type { RecentSession } from "@/types/stats";

const timerTypeText = {
  countdown: "倒计时",
  countup: "正计时",
  none: "不计时"
};

export function RecentSessionsCard({ sessions }: { sessions: RecentSession[] }) {
  return (
    <Card className="bg-white">
      <div className="mb-3">
        <p className="text-sm font-bold text-[var(--app-muted)]">最近专注记录</p>
        <h2 className="text-lg font-black text-[var(--app-text)]">记录列表</h2>
      </div>
      {sessions.length ? (
        <div className="space-y-2">
          {sessions.slice(0, 6).map((session) => (
            <div key={session.id} className="rounded-[18px] bg-[var(--app-card-soft)] p-3">
              <div className="flex items-center justify-between gap-3">
                <p className="min-w-0 flex-1 truncate text-sm font-black text-[var(--app-text)]">{session.taskTitle || "未命名待办"}</p>
                <Badge className={session.completed ? "border-[#CFEED8] bg-[#EAF8EF] text-[#31935A]" : "border-[#FAD0D5] bg-[#FFE8EA] text-[var(--app-danger)]"}>
                  {session.completed ? "完成" : "放弃"}
                </Badge>
              </div>
              <p className="mt-1 text-xs font-semibold text-[var(--app-muted)]">
                {timerTypeText[session.timerType]} · {timeText(session.startedAt)}-{timeText(session.endedAt)} · {formatMinutes(session.actualMinutes)}
              </p>
              {session.interruptReason ? <p className="mt-1 text-xs font-bold text-[var(--app-primary-strong)]">原因：{session.interruptReason}</p> : null}
            </div>
          ))}
        </div>
      ) : (
        <StatsEmptyState />
      )}
    </Card>
  );
}
