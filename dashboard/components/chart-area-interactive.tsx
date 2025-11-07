/**
 * ChartAreaInteractive Component
 *
 * Displays a time-series area chart showing article classification trends.
 * Shows three data series: Threats (red), Opportunities (green), Neutral (blue)
 *
 * This component receives chart data as props and allows filtering by time range.
 */

"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"
import type { ChartDataPoint } from "@/lib/types"

import { useIsMobile } from "@/hooks/use-mobile"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group"

// Chart configuration for colors and labels
const chartConfig = {
  threats: {
    label: "Threats",
    color: "hsl(0, 84%, 60%)", // Red color for threats
  },
  opportunities: {
    label: "Opportunities",
    color: "hsl(142, 76%, 36%)", // Green color for opportunities
  },
  neutral: {
    label: "Neutral",
    color: "hsl(221, 83%, 53%)", // Blue color for neutral
  },
} satisfies ChartConfig

interface ChartAreaInteractiveProps {
  data: ChartDataPoint[]
}

export function ChartAreaInteractive({ data: chartData }: ChartAreaInteractiveProps) {
  const isMobile = useIsMobile()
  const [timeRange, setTimeRange] = React.useState("30d")

  // Set initial time range based on screen size
  React.useEffect(() => {
    if (isMobile) {
      setTimeRange("7d")
    }
  }, [isMobile])

  // Filter data based on selected time range
  const filteredData = React.useMemo(() => {
    if (chartData.length === 0) return []

    const now = new Date()
    let daysToSubtract = 30

    if (timeRange === "90d") {
      daysToSubtract = 90
    } else if (timeRange === "7d") {
      daysToSubtract = 7
    }

    const startDate = new Date(now)
    startDate.setDate(startDate.getDate() - daysToSubtract)

    return chartData.filter((item) => {
      const date = new Date(item.date)
      return date >= startDate
    })
  }, [chartData, timeRange])

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Article Classification Trends</CardTitle>
        <CardDescription>
          <span className="hidden @[540px]/card:block">
            Daily article classifications over time
          </span>
          <span className="@[540px]/card:hidden">Classification trends</span>
        </CardDescription>
        <CardAction>
          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={setTimeRange}
            variant="outline"
            className="hidden *:data-[slot=toggle-group-item]:!px-4 @[767px]/card:flex"
          >
            <ToggleGroupItem value="90d">Last 3 months</ToggleGroupItem>
            <ToggleGroupItem value="30d">Last 30 days</ToggleGroupItem>
            <ToggleGroupItem value="7d">Last 7 days</ToggleGroupItem>
          </ToggleGroup>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger
              className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
              size="sm"
              aria-label="Select a value"
            >
              <SelectValue placeholder="Last 30 days" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="90d" className="rounded-lg">
                Last 3 months
              </SelectItem>
              <SelectItem value="30d" className="rounded-lg">
                Last 30 days
              </SelectItem>
              <SelectItem value="7d" className="rounded-lg">
                Last 7 days
              </SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        {filteredData.length === 0 ? (
          <div className="flex items-center justify-center h-[250px]">
            <p className="text-muted-foreground">
              No data available for the selected time range
            </p>
          </div>
        ) : (
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-[250px] w-full"
          >
            <AreaChart data={filteredData}>
              <defs>
                <linearGradient id="fillThreats" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-threats)"
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-threats)"
                    stopOpacity={0.1}
                  />
                </linearGradient>
                <linearGradient id="fillOpportunities" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-opportunities)"
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-opportunities)"
                    stopOpacity={0.1}
                  />
                </linearGradient>
                <linearGradient id="fillNeutral" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-neutral)"
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-neutral)"
                    stopOpacity={0.1}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
                tickFormatter={(value) => {
                  const date = new Date(value)
                  return date.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })
                }}
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    labelFormatter={(value) => {
                      return new Date(value).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    }}
                    indicator="dot"
                  />
                }
              />
              <Area
                dataKey="threats"
                type="natural"
                fill="url(#fillThreats)"
                stroke="var(--color-threats)"
                strokeWidth={2}
                stackId="a"
              />
              <Area
                dataKey="opportunities"
                type="natural"
                fill="url(#fillOpportunities)"
                stroke="var(--color-opportunities)"
                strokeWidth={2}
                stackId="a"
              />
              <Area
                dataKey="neutral"
                type="natural"
                fill="url(#fillNeutral)"
                stroke="var(--color-neutral)"
                strokeWidth={2}
                stackId="a"
              />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
