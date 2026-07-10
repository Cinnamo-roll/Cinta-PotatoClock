import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { AnimatedList, AnimatedListItem } from "@/components/common/AnimatedList";
import { Card } from "@/components/common/Card";
import { MetricTile } from "@/components/common/MetricTile";
import { MobileShell } from "@/components/layout/MobileShell";
import { AchievementEntry } from "@/components/stats/AchievementEntry";
import { CustomDateRangeModal } from "@/components/stats/CustomDateRangeModal";
import { FocusDurationDistributionCard } from "@/components/stats/FocusDurationDistributionCard";
import { FocusHeatmapDrawer } from "@/components/stats/FocusHeatmapDrawer";
import { FocusHistoryDrawer } from "@/components/stats/FocusHistoryDrawer";
import { MonthlyInterruptionReasonCard } from "@/components/stats/MonthlyInterruptionReasonCard";
import { MonthStatsCard } from "@/components/stats/MonthStatsCard";
import { SleepCheckinLineChartCard } from "@/components/stats/SleepCheckinLineChartCard";
import { StatsEmptyState } from "@/components/stats/StatsEmptyState";
import { StatsHeader } from "@/components/stats/StatsHeader";
import { StatsSharePanel } from "@/components/stats/StatsSharePanel";
import { TodayFocusCard } from "@/components/stats/TodayFocusCard";
import { TotalFocusCard } from "@/components/stats/TotalFocusCard";
import { WakeupCheckinLineChartCard } from "@/components/stats/WakeupCheckinLineChartCard";
import { WeeklySummaryModal } from "@/components/stats/WeeklySummaryModal";
import { YearStatsCard } from "@/components/stats/YearStatsCard";
import { formatDuration } from "@/components/stats/statsFormat";
import { useStatsQuery, useTimerSessionsRangeQuery } from "@/hooks/useApiQueries";
import { useTodayKey } from "@/hooks/useTodayKey";
import type { CheckinLineItem, StatsDateRange, StatsRange } from "@/types/stats";
import { daysInLocalMonth, localDateKey, localMonthKey } from "@/utils/date";

function toDateInput(date: Date) {
  return localDateKey(date);
}

function formatDate(date: Date) {
  return date.toLocaleDateString("zh-CN", { year: "numeric", month: "2-digit", day: "2-digit" }).replace(/\//g, "-");
}

function formatMonth(date: Date) {
  return localMonthKey(date);
}

function formatShortDate(value: string) {
  const [, month, day] = value.split("-");
  return day ? `${month}.${day}` : value;
}

function shiftMonth(date: Date, step: -1 | 1) {
  const next = new Date(date);
  next.setMonth(date.getMonth() + step);
  return next;
}

function rangeFor(range: StatsRange, anchor: Date, customRange: StatsDateRange): StatsDateRange {
  if (range === "custom") return customRange;
  const start = new Date(anchor);
  const end = new Date(anchor);
  if (range === "week") start.setDate(anchor.getDate() - 6);
  if (range === "month") start.setDate(1);
  return { startDate: toDateInput(start), endDate: toDateInput(end) };
}

function labelFor(range: StatsRange, anchor: Date, customRange: StatsDateRange) {
  if (range === "day") return formatShortDate(formatDate(anchor));
  if (range === "week") {
    const start = new Date(anchor);
    start.setDate(anchor.getDate() - 6);
    return `${formatShortDate(formatDate(start))} - ${formatShortDate(formatDate(anchor))}`;
  }
  if (range === "month") return anchor.toLocaleDateString("zh-CN", { year: "numeric", month: "2-digit" }).replace(/\//g, "-");
  if (customRange.startDate && customRange.endDate) return `${formatShortDate(customRange.startDate)} - ${formatShortDate(customRange.endDate)}`;
  return "自定范围";
}

function shiftAnchor(date: Date, range: StatsRange, step: -1 | 1) {
  const next = new Date(date);
  if (range === "day" || range === "custom") next.setDate(date.getDate() + step);
  if (range === "week") next.setDate(date.getDate() + step * 7);
  if (range === "month") next.setMonth(date.getMonth() + step);
  return next;
}

function retargetLineMonth(data: CheckinLineItem[], month: string): CheckinLineItem[] {
  const byDate = new Map(data.map((item) => [item.date, item]));
  return Array.from({ length: daysInLocalMonth(month) }, (_, index) => {
    const day = index + 1;
    const date = `${month}-${String(day).padStart(2, "0")}`;
    const source = byDate.get(date);
    return {
      date,
      time: source?.time ?? null,
      minutesOfDay: source?.minutesOfDay ?? null
    };
  });
}

function completedSeconds(session: { actualMinutes: number; actualSeconds?: number }) {
  return session.actualSeconds ?? session.actualMinutes * 60;
}

export default function StatsPage() {
  const [searchParams] = useSearchParams();
  const collectionParam = searchParams.get("collectionId");
  const requestedCollectionId = collectionParam ? Number(collectionParam) : Number.NaN;
  const collectionId = Number.isFinite(requestedCollectionId) ? requestedCollectionId : null;
  const collectionName = searchParams.get("collectionName") ?? "";
  const todoParam = searchParams.get("todoId");
  const requestedTodoId = todoParam ? Number(todoParam) : Number.NaN;
  const todoId = Number.isFinite(requestedTodoId) ? requestedTodoId : null;
  const todoName = searchParams.get("todoName") ?? "";
  const [range, setRange] = useState<StatsRange>("day");
  const [anchorDate, setAnchorDate] = useState(() => new Date());
  const [statsMonthDate, setStatsMonthDate] = useState(() => new Date());
  const [statsYear, setStatsYear] = useState(() => new Date().getFullYear());
  const [customRange, setCustomRange] = useState<StatsDateRange>(() => {
    const end = new Date();
    const start = new Date(end);
    start.setDate(end.getDate() - 6);
    return { startDate: toDateInput(start), endDate: toDateInput(end) };
  });
  const [customOpen, setCustomOpen] = useState(false);
  const [recordMenuOpen, setRecordMenuOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [heatmapOpen, setHeatmapOpen] = useState(false);
  const [weeklyOpen, setWeeklyOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [achievementOpen, setAchievementOpen] = useState(false);

  const dateRange = useMemo(() => rangeFor(range, anchorDate, customRange), [anchorDate, customRange, range]);
  const monthLabel = formatMonth(statsMonthDate);
  const statsOptions = useMemo(() => ({ month: monthLabel, year: statsYear, collectionId, todoId }), [collectionId, monthLabel, statsYear, todoId]);
  const { data, error, isError, isFetching, isLoading, isPlaceholderData } = useStatsQuery(range, dateRange, statsOptions);
  const todayKey = useTodayKey();
  const { data: collectionSessions = [], isFetching: isFetchingCollectionSessions } = useTimerSessionsRangeQuery(
    "1970-01-01",
    todayKey,
    { collectionId },
    collectionId != null
  );
  const dateLabel = useMemo(() => labelFor(range, anchorDate, customRange), [anchorDate, customRange, range]);
  const wakeupLine = useMemo(() => (data ? retargetLineMonth(data.wakeupLine, monthLabel) : []), [data, monthLabel]);
  const sleepLine = useMemo(() => (data ? retargetLineMonth(data.sleepLine, monthLabel) : []), [data, monthLabel]);
  const collectionStats = useMemo(() => {
    const completedSessions = collectionSessions.filter((session) => session.completed && !session.interrupted && session.countToStats !== false);
    const focusSeconds = completedSessions.reduce((sum, session) => sum + completedSeconds(session), 0);
    return {
      completedSessions,
      focusSeconds,
      activeDays: new Set(completedSessions.map((session) => session.startedAt.slice(0, 10))).size
    };
  }, [collectionSessions]);

  if (isLoading && !data) {
    return (
      <MobileShell>
        <StatsEmptyState title="数据加载中" description="正在整理你的专注记录。" />
      </MobileShell>
    );
  }

  if (isError || !data) {
    return (
      <MobileShell>
        <StatsEmptyState title="数据加载失败" description={error instanceof Error ? error.message : "请检查后端服务或 API 配置后再试。"} />
      </MobileShell>
    );
  }

  const preserveScroll = (update: () => void) => {
    const scrollY = window.scrollY;
    update();
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => window.scrollTo({ top: scrollY }));
    });
  };

  const shiftStatsDate = (step: -1 | 1) => preserveScroll(() => setAnchorDate((date) => shiftAnchor(date, range, step)));
  const shiftStatsMonth = (step: -1 | 1) => preserveScroll(() => setStatsMonthDate((date) => shiftMonth(date, step)));
  const shiftStatsYear = (step: -1 | 1) => preserveScroll(() => setStatsYear((year) => year + step));
  const monthStats = data.monthly;
  const yearly = data.yearly;
  const isTodoStats = todoId != null;
  const isScopedStats = collectionId != null || todoId != null;

  return (
    <MobileShell>
      <AnimatedList className="space-y-3 pb-4" stagger={0.04}>
        <StatsHeader onOpenAchievements={() => setAchievementOpen(true)} onOpenShare={() => setShareOpen(true)} />
        {isFetching ? (
          <div className="pointer-events-none fixed left-1/2 top-[calc(var(--safe-top)+0.75rem)] z-50 flex w-fit -translate-x-1/2 items-center gap-2 rounded-full border border-[color-mix(in_srgb,var(--app-border)_62%,transparent)] bg-[color-mix(in_srgb,var(--app-card)_82%,transparent)] px-3 py-1.5 text-xs font-black text-[var(--app-primary-strong)] shadow-[0_8px_24px_color-mix(in_srgb,var(--app-primary)_12%,transparent)] backdrop-blur-[18px]">
            <span className="h-2 w-2 animate-pulse rounded-full bg-[var(--app-primary)]" />
            {isPlaceholderData ? "正在更新" : "同步中"}
          </div>
        ) : null}
        {collectionId ? (
          <AnimatedListItem>
          <Card className="bg-white">
            <p className="text-xs font-black text-[var(--app-muted)]">待办集统计</p>
            <h2 className="mt-1 text-xl font-black text-[var(--app-text)]">{collectionName || `待办集 #${collectionId}`}</h2>
            {isFetchingCollectionSessions ? <p className="mt-2 text-xs font-bold text-[var(--app-muted)]">正在同步待办集历史记录...</p> : null}
            <div className="mt-4 grid grid-cols-3 gap-2">
              <MetricTile label="完成次数" value={collectionStats.completedSessions.length} valueClassName="text-lg" />
              <MetricTile label="专注时长" value={formatDuration(collectionStats.focusSeconds)} valueClassName="text-lg" />
              <MetricTile label="活跃天数" value={collectionStats.activeDays} valueClassName="text-lg" />
            </div>
          </Card>
          </AnimatedListItem>
        ) : null}
        {todoId ? (
          <AnimatedListItem>
          <Card className="bg-white">
            <p className="text-xs font-black text-[var(--app-muted)]">当前待办统计</p>
            <h2 className="mt-1 text-xl font-black text-[var(--app-text)]">{todoName || `待办 #${todoId}`}</h2>
          </Card>
          </AnimatedListItem>
        ) : null}
        <AnimatedListItem>
          <TotalFocusCard summary={data.summary} />
        </AnimatedListItem>
        <AnimatedListItem>
          <TodayFocusCard today={data.today} />
        </AnimatedListItem>
        <AnimatedListItem>
          <FocusDurationDistributionCard
            data={data.focusDurationDistribution}
            dateLabel={dateLabel}
            range={range}
            menuOpen={recordMenuOpen}
            onRangeChange={(nextRange) => {
              preserveScroll(() => setRange(nextRange));
              setRecordMenuOpen(false);
            }}
            onShiftDate={shiftStatsDate}
            onToggleMenu={() => setRecordMenuOpen((open) => !open)}
            onOpenCustom={() => setCustomOpen(true)}
            onOpenHistory={() => {
              setRecordMenuOpen(false);
              setHistoryOpen(true);
            }}
            onOpenHeatmap={() => {
              setRecordMenuOpen(false);
              setHeatmapOpen(true);
            }}
            onOpenWeekly={() => {
              setRecordMenuOpen(false);
              setWeeklyOpen(true);
            }}
          />
        </AnimatedListItem>
        {!isScopedStats ? (
          <AnimatedListItem>
            <WakeupCheckinLineChartCard month={monthLabel} data={wakeupLine} onShiftMonth={shiftStatsMonth} />
          </AnimatedListItem>
        ) : null}
        {!isScopedStats ? (
          <AnimatedListItem>
            <SleepCheckinLineChartCard month={monthLabel} data={sleepLine} onShiftMonth={shiftStatsMonth} />
          </AnimatedListItem>
        ) : null}
        <AnimatedListItem>
          <MonthlyInterruptionReasonCard month={monthLabel} reasons={data.interruptionReasons} onShiftMonth={shiftStatsMonth} />
        </AnimatedListItem>
        <AnimatedListItem>
          <MonthStatsCard monthly={monthStats} onShiftMonth={shiftStatsMonth} />
        </AnimatedListItem>
        <AnimatedListItem>
          <YearStatsCard yearly={yearly} onShiftYear={shiftStatsYear} />
        </AnimatedListItem>
      </AnimatedList>

      <CustomDateRangeModal open={customOpen} value={customRange} onChange={(nextRange) => preserveScroll(() => setCustomRange(nextRange))} onClose={() => setCustomOpen(false)} />
      <FocusHistoryDrawer open={historyOpen} collectionId={collectionId} todoId={todoId} includeCheckins={!isScopedStats} onClose={() => setHistoryOpen(false)} />
      <FocusHeatmapDrawer open={heatmapOpen} collectionId={collectionId} todoId={todoId} onClose={() => setHeatmapOpen(false)} />
      <WeeklySummaryModal open={weeklyOpen} collectionId={collectionId} todoId={todoId} onClose={() => setWeeklyOpen(false)} />
      <StatsSharePanel open={shareOpen} summary={data.summary} onClose={() => setShareOpen(false)} />
      <AchievementEntry open={achievementOpen} summary={data.summary} stats={data} onClose={() => setAchievementOpen(false)} />
    </MobileShell>
  );
}
