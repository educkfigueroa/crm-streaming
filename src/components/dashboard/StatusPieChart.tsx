"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

interface StatusPieChartProps {
  activas: number;
  porVencer: number;
  vencidas: number;
}

const COLORS = {
  activas: "#10b981",
  porVencer: "#f59e0b",
  vencidas: "#ef4444",
};

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; payload: { label: string } }>;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl px-3 py-2 bg-popover border border-border shadow-xl text-xs">
      <p className="font-medium text-foreground">{payload[0].payload.label}: {payload[0].value}</p>
    </div>
  );
}

export function StatusPieChart({ activas, porVencer, vencidas }: StatusPieChartProps) {
  const total = activas + porVencer + vencidas;

  if (total === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">
        Sin datos
      </div>
    );
  }

  const data = [
    { name: "activas", label: "Activas", value: activas },
    { name: "porVencer", label: "Por Vencer", value: porVencer },
    { name: "vencidas", label: "Vencidas", value: vencidas },
  ].filter((d) => d.value > 0);

  return (
    <div className="flex items-center gap-4">
      <div className="w-32 h-32 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={28}
              outerRadius={52}
              paddingAngle={3}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry) => (
                <Cell
                  key={entry.name}
                  fill={COLORS[entry.name as keyof typeof COLORS]}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="space-y-2 flex-1">
        {data.map((entry) => (
          <div key={entry.name} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <div
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: COLORS[entry.name as keyof typeof COLORS] }}
              />
              <span className="text-muted-foreground">{entry.label}</span>
            </div>
            <span className="font-semibold tabular-nums text-foreground">{entry.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
