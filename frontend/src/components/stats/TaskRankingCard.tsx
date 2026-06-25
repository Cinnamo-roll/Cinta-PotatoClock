import { motion, useReducedMotion } from "motion/react";
import { Card } from "@/components/common/Card";
import { StatsEmptyState } from "@/components/stats/StatsEmptyState";
import { formatMinutes } from "@/components/stats/statsFormat";
import type { TaskStatsItem } from "@/types/stats";

export function TaskRankingCard({ tasks }: { tasks: TaskStatsItem[] }) {
  const reduceMotion = useReducedMotion();
  const maxMinutes = Math.max(1, ...tasks.map((task) => task.focusMinutes));

  return (
    <Card className="bg-white">
      <div className="mb-3">
        <p className="text-sm font-bold text-[var(--app-muted)]">待办专注排行</p>
        <h2 className="text-lg font-black text-[var(--app-text)]">高频投入</h2>
      </div>
      {tasks.length ? (
        <div className="space-y-3">
          {tasks.map((task, index) => (
            <div key={task.taskId} className="rounded-[18px] bg-[var(--app-card-soft)] p-3">
              <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                <p className="min-w-0 flex-1 truncate font-black text-[var(--app-text)]">
                  {index + 1}. {task.taskTitle}
                </p>
                <p className="font-bold text-[var(--app-muted)]">{formatMinutes(task.focusMinutes)}</p>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-white">
                <motion.div
                  animate={{ width: `${Math.max(8, (task.focusMinutes / maxMinutes) * 100)}%` }}
                  className="h-full rounded-full bg-[var(--app-primary)]"
                  initial={{ width: reduceMotion ? `${Math.max(8, (task.focusMinutes / maxMinutes) * 100)}%` : "0%" }}
                  transition={{ delay: reduceMotion ? 0 : index * 0.04, duration: reduceMotion ? 0 : 0.5, ease: "easeOut" }}
                />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <StatsEmptyState />
      )}
    </Card>
  );
}
