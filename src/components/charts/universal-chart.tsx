import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
type TooltipPayload = {
  name?: string | number;
  value?: number | string;
  color?: string;
};

type ChartTooltipProps = {
  active?: boolean;
  label?: string | number;
  payload?: TooltipPayload[];
  unit?: string;
};

type ChartDataPoint = {
  label: string;
  value: number;
  secondaryValue?: number;
};

type ChartCommonConfig = {
  title: string;
  subtitle?: string;
  unit?: string;
  meta?: { label: string; value: string }[];
};

export type BarChartConfig = ChartCommonConfig & {
  type: "bar";
  data: ChartDataPoint[];
  stacked?: boolean;
};

export type LineChartConfig = ChartCommonConfig & {
  type: "line";
  data: ChartDataPoint[];
  smooth?: boolean;
};

export type PieChartConfig = ChartCommonConfig & {
  type: "pie";
  data: ChartDataPoint[];
};

export type UniversalChartConfig =
  | BarChartConfig
  | LineChartConfig
  | PieChartConfig;

type UniversalChartProps = {
  config: UniversalChartConfig;
  height?: number;
};

const CHART_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

export function UniversalChart({ config, height = 260 }: UniversalChartProps) {
  const legendItems = config.data ?? [];

  return (
    <div className="rounded-2xl border border-border/60 bg-card/70 p-5 shadow-[inset_0_-1px_0_0_rgba(15,23,42,0.08)]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">
            {config.subtitle ?? "Analytics"}
          </p>
          <h5 className="text-lg font-semibold text-foreground">
            {config.title}
          </h5>
        </div>
        {config.meta && (
          <div className="flex flex-wrap gap-4 text-right text-xs text-muted-foreground">
            {config.meta.map((item) => (
              <div key={item.label}>
                <p className="text-sm font-semibold text-foreground">{item.value}</p>
                <p>{item.label}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-5" style={{ height }}>
        {config.type === "bar" && (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={config.data} barGap={16}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: "var(--muted-foreground)" }} />
              <YAxis tickLine={false} axisLine={false} tick={{ fill: "var(--muted-foreground)" }} width={32} />
              <Tooltip content={<ChartTooltip unit={config.unit} />} />
              <Legend formatter={(value) => value.toString()} />
              <Bar dataKey="value" name="当期" radius={[6, 6, 0, 0]} fill="var(--primary)" />
              {config.stacked && (
                <Bar
                  dataKey="secondaryValue"
                  name="对比"
                  radius={[6, 6, 0, 0]}
                  fill="var(--chart-2)"
                />
              )}
            </BarChart>
          </ResponsiveContainer>
        )}

        {config.type === "line" && (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={config.data} margin={{ top: 16, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: "var(--muted-foreground)" }} />
              <YAxis tickLine={false} axisLine={false} tick={{ fill: "var(--muted-foreground)" }} width={32} />
              <Tooltip content={<ChartTooltip unit={config.unit} />} />
              <Line
                type={config.smooth ? "monotone" : "linear"}
                dataKey="value"
                stroke="var(--primary)"
                strokeWidth={3}
                dot={{ stroke: "var(--primary)", fill: "var(--background)", strokeWidth: 2 }}
                activeDot={{ r: 6 }}
                name="当期"
              />
              <Line
                type={config.smooth ? "monotone" : "linear"}
                dataKey="secondaryValue"
                stroke="var(--chart-2)"
                strokeWidth={2}
                dot={false}
                name="环比"
              />
            </LineChart>
          </ResponsiveContainer>
        )}

        {config.type === "pie" && (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={config.data}
                dataKey="value"
                nameKey="label"
                innerRadius={70}
                outerRadius={110}
                paddingAngle={2}
              >
                {config.data.map((entry, index) => (
                  <Cell key={`${entry.label}-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<ChartTooltip unit={config.unit} />} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )}

        {config.data.length === 0 && <ChartEmptyState />}
      </div>

      <div className="mt-5 flex flex-wrap gap-4 text-xs text-muted-foreground">
        {legendItems.map((item, index) => (
          <div key={`${config.title}-${item.label}-${index}`} className="flex items-center gap-2">
            <span
              className="size-2.5 rounded-full"
              style={{ background: CHART_COLORS[index % CHART_COLORS.length] }}
            />
            <div className="flex items-center gap-2">
              <span>{item.label}</span>
              <span className="font-semibold text-foreground">
                {formatValue(item.value, config.unit)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const formatValue = (value: number, unit?: string) => {
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}k${unit ?? ""}`;
  }
  return `${value}${unit ?? ""}`;
};

function ChartTooltip({ active, payload, label, unit }: ChartTooltipProps) {
  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div className="rounded-xl border border-border/60 bg-background/90 px-3 py-2 text-xs shadow-lg">
      <p className="text-muted-foreground">{label}</p>
      <div className="mt-2 space-y-1">
        {payload.map((entry) => (
          <div key={entry.name?.toString()} className="flex items-center gap-2">
            <span
              className="size-2 rounded-full"
              style={{ background: entry.color ?? "var(--primary)" }}
            />
            <span className="text-muted-foreground">{entry.name}</span>
            <span className="font-semibold text-foreground">
              {entry.value}
              {unit ?? ""}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

const ChartEmptyState = () => (
  <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-border/60 text-sm text-muted-foreground">
    暂无数据
  </div>
);
