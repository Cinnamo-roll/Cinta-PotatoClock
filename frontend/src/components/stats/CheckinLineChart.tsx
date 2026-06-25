import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { chartAnimation } from "@/components/stats/chartAnimation";
import { StatsEmptyState } from "@/components/stats/StatsEmptyState";
import type { CheckinLineItem } from "@/types/stats";

function minuteToTime(value: number) {
  const normalized = value >= 1440 ? value - 1440 : value;
  const hour = Math.floor(normalized / 60);
  const minute = normalized % 60;
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

function dateLabel(date: string) {
  return date.slice(5);
}

function CheckinTooltip({
  active,
  label,
  payload,
  tooltipLabel
}: {
  active?: boolean;
  label?: string | number;
  payload?: ReadonlyArray<{ payload?: CheckinLineItem }>;
  tooltipLabel: string;
}) {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload;
  if (!point) return null;
  return (
    <div className="rounded-2xl border border-white/80 bg-white/90 px-3 py-2 text-xs font-bold shadow-[0_10px_28px_rgba(120,70,90,.12)] backdrop-blur-[18px]">
      <p className="text-[var(--app-muted)]">日期 {dateLabel(String(label ?? point.date))}</p>
      <p className="mt-1 text-[var(--app-text)]">{point.time ? `${tooltipLabel} ${point.time}` : "未打卡"}</p>
    </div>
  );
}

export function CheckinLineChart({
  data,
  emptyText,
  tooltipLabel
}: {
  data: CheckinLineItem[];
  emptyText: string;
  tooltipLabel: string;
}) {
  if (!data.some((item) => item.minutesOfDay !== null)) return <StatsEmptyState title={emptyText} description="打卡后显示" />;

  const checkedItems = data.filter((item) => item.time && item.minutesOfDay !== null).slice(-4).reverse();
  const gradientId = `checkin-time-fill-${tooltipLabel.codePointAt(0) ?? 0}-${data.length}`;

  return (
    <div className="space-y-3">
      <div className="h-[190px] rounded-[22px] bg-[var(--app-card-soft)] p-3">
        <ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 1, height: 1 }}>
          <AreaChart data={data} margin={{ left: -12, right: 8, top: 8, bottom: 0 }}>
            <defs>
              <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
                <stop offset="5%" stopColor="var(--app-primary)" stopOpacity={0.26} />
                <stop offset="95%" stopColor="var(--app-primary-soft)" stopOpacity={0.04} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(120,80,100,0.07)" vertical={false} />
            <XAxis dataKey="date" tickFormatter={dateLabel} tick={{ fill: "var(--app-muted)", fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis
              domain={["dataMin - 30", "dataMax + 30"]}
              tickFormatter={(value) => minuteToTime(Number(value))}
              tick={{ fill: "var(--app-muted)", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              width={42}
            />
            <Tooltip content={(props) => <CheckinTooltip {...props} tooltipLabel={tooltipLabel} />} cursor={{ stroke: "rgba(245,140,178,.24)", strokeWidth: 2 }} />
            <Area
              type="monotone"
              dataKey="minutesOfDay"
              fill={`url(#${gradientId})`}
              stroke="var(--app-primary)"
              strokeWidth={3}
              dot={(props: any) => {
                const point = props.payload as CheckinLineItem;
                if (point.minutesOfDay === null) return <g />;
                return (
                  <circle cx={props.cx} cy={props.cy} r={4} fill="var(--app-primary)" stroke="#fff" strokeWidth={2}>
                    <title>{`日期 ${dateLabel(point.date)}，${tooltipLabel} ${point.time ?? "未打卡"}`}</title>
                  </circle>
                );
              }}
              activeDot={{ r: 6, stroke: "#fff", strokeWidth: 2 }}
              connectNulls={false}
              {...chartAnimation}
              animationBegin={180}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      {checkedItems.length > 0 ? (
        <div className="grid grid-cols-2 gap-2">
          {checkedItems.map((item) => (
            <div key={`${tooltipLabel}-${item.date}`} className="rounded-2xl bg-[var(--app-card-soft)] px-3 py-2">
              <p className="text-[11px] font-black text-[var(--app-muted)]">{dateLabel(item.date)}</p>
              <p className="mt-0.5 text-xs font-black text-[var(--app-text)]">
                {tooltipLabel} {item.time}
              </p>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
