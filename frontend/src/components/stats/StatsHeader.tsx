import type { ReactNode } from "react";
import { Award, BarChart3, Share2 } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";

interface StatsHeaderProps {
  onOpenAchievements: () => void;
  onOpenShare: () => void;
}

function HeaderButton({ label, children, onClick }: { label: string; children: ReactNode; onClick: () => void }) {
  return (
    <button
      aria-label={label}
      className="app-header-button"
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
}

export function StatsHeader({ onOpenAchievements, onOpenShare }: StatsHeaderProps) {
  return (
    <PageHeader
      icon={BarChart3}
      title="数据统计"
      description="专注记录与趋势"
      action={
        <div className="flex gap-2">
          <HeaderButton label="徽章成就" onClick={onOpenAchievements}>
            <Award size={17} />
          </HeaderButton>
          <HeaderButton label="分享" onClick={onOpenShare}>
            <Share2 size={17} />
          </HeaderButton>
        </div>
      }
    />
  );
}
