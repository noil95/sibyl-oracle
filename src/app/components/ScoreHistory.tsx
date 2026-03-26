"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

interface DataPoint {
  computed_at: string;
  win_probability: number;
}

interface ScoreHistoryProps {
  data: DataPoint[];
  candidateName: string;
  party: string;
}

const PARTY_COLORS: Record<string, { stroke: string; fill: string }> = {
  Democrat: { stroke: "#3b82f6", fill: "url(#blueGradient)" },
  Republican: { stroke: "#ef4444", fill: "url(#redGradient)" },
};

export default function ScoreHistory({
  data,
  candidateName,
  party,
}: ScoreHistoryProps) {
  const colors = PARTY_COLORS[party] ?? {
    stroke: "#7c3aed",
    fill: "url(#purpleGradient)",
  };

  const chartData = data.map((d) => ({
    time: new Date(d.computed_at).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }),
    probability: Math.round(d.win_probability * 100),
  }));

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 text-[var(--text-tertiary)] text-sm">
        <div className="text-center space-y-2">
          <div className="text-2xl text-[var(--text-label)]">---</div>
          <p>History builds as predictions update</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-52 sm:h-64">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: -15 }}>
          <defs>
            <linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.2} />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="redGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ef4444" stopOpacity={0.2} />
              <stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="purpleGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#7c3aed" stopOpacity={0.2} />
              <stop offset="100%" stopColor="#7c3aed" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="time"
            stroke="var(--border-primary)"
            tick={{ fill: "var(--text-label)", fontSize: 10 }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            domain={[0, 100]}
            stroke="var(--border-primary)"
            tick={{ fill: "var(--text-label)", fontSize: 10 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `${v}%`}
          />
          <ReferenceLine
            y={50}
            stroke="var(--border-primary)"
            strokeDasharray="3 3"
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--bg-elevated)",
              border: "1px solid var(--border-primary)",
              borderRadius: "8px",
              color: "var(--text-primary)",
              fontSize: "12px",
              padding: "8px 12px",
            }}
            formatter={(value) => [`${value}%`, candidateName]}
          />
          <Area
            type="monotone"
            dataKey="probability"
            stroke={colors.stroke}
            fill={colors.fill}
            strokeWidth={2}
            dot={false}
            animationDuration={1000}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
