/**
 * Dashboard Page
 *
 * This is a Next.js Server Component that fetches data from our API routes
 * and passes it to the client components.
 */

import { AppSidebar } from "@/components/app-sidebar"
import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { ActivityLineChart } from "@/components/activity-line-chart"
import { MetricCards } from "@/components/metric-cards"
import { UploadArticleDialog } from "@/components/upload-article-dialog"
import { SectionCards } from "@/components/section-cards"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import type { Stats, ChartDataPoint, ActivityDataPoint, Metrics } from "@/lib/types"

/**
 * Fetch dashboard statistics from our API
 */
async function getStats(): Promise<Stats> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

    const res = await fetch(`${baseUrl}/api/stats`, {
      next: { revalidate: 60 }
    })

    if (!res.ok) {
      throw new Error('Failed to fetch stats')
    }

    return res.json()
  } catch (error) {
    console.error('Error fetching stats:', error)
    return { total: 0, threats: 0, opportunities: 0, neutral: 0, unclassified: 0 }
  }
}

/**
 * Fetch chart data from our API
 */
async function getChartData(): Promise<ChartDataPoint[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

    const res = await fetch(`${baseUrl}/api/chart-data?days=90`, {
      next: { revalidate: 60 }
    })

    if (!res.ok) {
      throw new Error('Failed to fetch chart data')
    }

    return res.json()
  } catch (error) {
    console.error('Error fetching chart data:', error)
    return []
  }
}

/**
 * Fetch activity data (published vs classified)
 */
async function getActivityData(): Promise<ActivityDataPoint[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

    const res = await fetch(`${baseUrl}/api/activity-data?days=90`, {
      next: { revalidate: 60 }
    })

    if (!res.ok) {
      throw new Error('Failed to fetch activity data')
    }

    return res.json()
  } catch (error) {
    console.error('Error fetching activity data:', error)
    return []
  }
}

/**
 * Fetch metrics (backlog, service level, own articles)
 */
async function getMetrics(): Promise<Metrics> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

    const res = await fetch(`${baseUrl}/api/metrics`, {
      next: { revalidate: 60 }
    })

    if (!res.ok) {
      throw new Error('Failed to fetch metrics')
    }

    return res.json()
  } catch (error) {
    console.error('Error fetching metrics:', error)
    return { backlog: 0, serviceLevel: 0, ownArticles: 0 }
  }
}

/**
 * Main Dashboard Page Component
 */
export default async function Page() {
  // Fetch all data in parallel for better performance
  const [stats, chartData, activityData, metrics] = await Promise.all([
    getStats(),
    getChartData(),
    getActivityData(),
    getMetrics(),
  ])

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              {/* Summary Cards */}
              <SectionCards stats={stats} />

              {/* Classification Trends Bar Chart */}
              <div className="px-4 lg:px-6">
                <ChartAreaInteractive data={chartData} />
              </div>

              {/* Activity Line Chart and Metrics - Side by Side */}
              <div className="px-4 lg:px-6">
                <div className="grid gap-4 grid-cols-1 lg:grid-cols-3">
                  {/* Activity Line Chart - Takes 2 columns */}
                  <div className="lg:col-span-2">
                    <ActivityLineChart data={activityData} />
                  </div>

                  {/* Metrics and Upload - Stacked */}
                  <div className="flex flex-col gap-4">
                    <MetricCards metrics={metrics} />
                    <UploadArticleDialog />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
