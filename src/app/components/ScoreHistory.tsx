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
    stroke: "#6b7280",
    fill: "url(#grayGradient)",
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
      <div className="flex items-center justify-center py-12 text-white/20 text-sm">
        <div className="text-center space-y-2">
          <div className="text-2xl">---</div>
          <p>History builds as predictions update every 15 minutes</p>
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
              <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="redGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ef4444" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="grayGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6b7280" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#6b7280" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="time"
            stroke="#ffffff10"
            tick={{ fill: "#ffffff25", fontSize: 10 }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            domain={[0, 100]}
            stroke="#ffffff10"
            tick={{ fill: "#ffffff25", fontSize: 10 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `${v}%`}
          />
          <ReferenceLine
            y={50}
            stroke="#ffffff10"
            strokeDasharray="3 3"
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "rgba(15, 15, 35, 0.95)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "12px",
              color: "#fff",
              fontSize: "12px",
              padding: "8px 12px",
              backdropFilter: "blur(8px)",
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
