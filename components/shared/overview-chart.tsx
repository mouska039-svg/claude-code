"use client"

import dynamic from "next/dynamic"
import { Skeleton } from "@/components/ui/skeleton"

const AreaChart = dynamic(
  () => import("recharts").then((m) => {
    const { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } = m
    function Chart({ data }: { data: { date: string; count: number }[] }) {
      return (
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(217.2 91.2% 59.8%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(217.2 91.2% 59.8%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(217.2 32.6% 17.5%)" />
            <XAxis
              dataKey="date"
              tick={{ fill: "hsl(215 20.2% 65.1%)", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "hsl(215 20.2% 65.1%)", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                background: "hsl(222.2 84% 4.9%)",
                border: "1px solid hsl(217.2 32.6% 17.5%)",
                borderRadius: "8px",
                color: "hsl(210 40% 98%)",
                fontSize: 12,
              }}
            />
            <Area
              type="monotone"
              dataKey="count"
              stroke="hsl(217.2 91.2% 59.8%)"
              strokeWidth={2}
              fill="url(#colorCount)"
            />
          </AreaChart>
        </ResponsiveContainer>
      )
    }
    return Chart
  }),
  { ssr: false, loading: () => <Skeleton className="h-[200px] w-full" /> }
)

export function OverviewChart({ data }: { data: { date: string; count: number }[] }) {
  return <AreaChart data={data} />
}
