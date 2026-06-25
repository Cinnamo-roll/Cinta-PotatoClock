import { ArrowRight, Sprout } from "lucide-react";
import { Link } from "react-router-dom";
import { Card } from "@/components/common/Card";
import { Badge } from "@/components/common/Badge";
import type { Task } from "@/types/task";

interface CurrentTaskCardProps {
  task?: Task;
}

export function CurrentTaskCard({ task }: CurrentTaskCardProps) {
  if (!task) {
    return (
      <Card className="flex items-center justify-between gap-3">
        <div>
          <p className="font-black text-soil dark:text-cream">还没有选择任务</p>
          <p className="mt-1 text-sm text-soil/60 dark:text-cream/60">选择一个待办开始专注</p>
        </div>
        <Link className="rounded-full bg-potato px-4 py-2 text-sm font-bold text-soil" to="/tasks">
          去选择
        </Link>
      </Card>
    );
  }

  return (
    <Card className="relative overflow-hidden">
      <div className="absolute -right-5 -top-5 h-20 w-20 rounded-full bg-potato/35" />
      <div className="relative flex items-start justify-between gap-3">
        <div>
          <Badge className="mb-2">
            <Sprout size={13} />
            当前待办
          </Badge>
          <h2 className="text-lg font-black text-soil dark:text-cream">{task.title}</h2>
          <p className="mt-1 text-sm text-soil/60 dark:text-cream/60">
            已完成 {task.completedPotatoes} / {task.estimatedPotatoes}
          </p>
        </div>
        <Link className="flex h-10 w-10 items-center justify-center rounded-full bg-white/60 text-soil dark:bg-white/10 dark:text-cream" to="/tasks" aria-label="切换任务">
          <ArrowRight size={18} />
        </Link>
      </div>
    </Card>
  );
}
