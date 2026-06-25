import { Check, PenLine, Sprout } from "lucide-react";
import { Button } from "@/components/common/Button";
import { Badge } from "@/components/common/Badge";
import { Card } from "@/components/common/Card";
import type { Task, TaskStatus } from "@/types/task";
import { cn } from "@/utils/cn";

const priorityText = {
  low: "轻轻种",
  medium: "稳稳种",
  high: "先种它"
};

interface TaskCardProps {
  task: Task;
  onSelect: (task: Task) => void;
  onEdit: (task: Task) => void;
  onStatus: (task: Task, status: TaskStatus) => void;
  onDelete: (task: Task) => void;
}

export function TaskCard({ task, onSelect, onEdit, onStatus, onDelete }: TaskCardProps) {
  const done = task.status === "done";

  return (
    <Card className={cn("relative overflow-hidden", done && "opacity-72")}>
      <div className="absolute right-4 top-4 text-2xl">🥔</div>
      <div className="pr-10">
        <div className="mb-2 flex flex-wrap gap-2">
          <Badge className={task.priority === "high" ? "bg-[#f7c2a1]/70" : task.priority === "medium" ? "bg-potato/50" : "bg-leaf/25"}>
            {priorityText[task.priority]}
          </Badge>
          {task.selected ? <Badge className="bg-leaf/25">当前任务</Badge> : null}
        </div>
        <h3 className={cn("text-base font-black text-soil dark:text-cream", done && "line-through")}>{task.title}</h3>
        {task.description ? <p className="mt-1 text-sm text-soil/60 dark:text-cream/60">{task.description}</p> : null}
        <div className="mt-4 flex items-center justify-between gap-2">
          <p className="flex items-center gap-1 text-sm font-bold text-caramel dark:text-potato">
            <Sprout size={15} />
            {task.completedPotatoes} / {task.estimatedPotatoes} 次
          </p>
          <div className="flex gap-2">
            <button className="rounded-full bg-white/55 p-2 dark:bg-white/10" onClick={() => onEdit(task)} aria-label="编辑任务">
              <PenLine size={17} />
            </button>
            <button
              className="rounded-full bg-white/55 p-2 dark:bg-white/10"
              onClick={() => onStatus(task, done ? "doing" : "done")}
              aria-label={done ? "恢复任务" : "完成任务"}
            >
              <Check size={17} />
            </button>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <Button variant="secondary" onClick={() => onSelect(task)}>
            选择为当前待办
          </Button>
          <Button variant="ghost" onClick={() => onDelete(task)}>
            删除
          </Button>
        </div>
      </div>
    </Card>
  );
}
